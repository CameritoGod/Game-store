const axios = require('axios');
require('dotenv').config();

const cache = require('../utils/cache');

class IGDBService {
  constructor() {
    this.clientId = process.env.IGDB_CLIENT_ID;
    this.clientSecret = process.env.IGDB_CLIENT_SECRET;

    this.tokenUrl =
      process.env.IGDB_TOKEN_URL ||
      'https://id.twitch.tv/oauth2/token';

    this.apiUrl =
      process.env.IGDB_API_URL ||
      'https://api.igdb.com/v4';

    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // ==========================================
  // AUTENTICACIÓN
  // ==========================================

  async getAccessToken() {
    // Reutilizar token mientras siga siendo válido
    if (
      this.accessToken &&
      this.tokenExpiry &&
      Date.now() < this.tokenExpiry
    ) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(this.tokenUrl, null, {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        }
      });

      this.accessToken = response.data.access_token;

      // Dejamos 60 segundos de margen antes de la expiración real
      this.tokenExpiry =
        Date.now() + (response.data.expires_in - 60) * 1000;

      console.log('✅ Token de IGDB obtenido correctamente');

      return this.accessToken;
    } catch (error) {
      console.error(
        '❌ Error al obtener token de IGDB:',
        error.response?.data || error.message
      );
      throw new Error('No se pudo autenticar con IGDB');
    }
  }

  // ==========================================
  // QUERY GENÉRICA
  // ==========================================

  async query(
    endpoint,
    fields,
    where = '',
    limit = 20,
    sort = '',
    search = '',
    offset = 0
  ) {
    const token = await this.getAccessToken();
    const queryParts = [];

    // SEARCH
    if (search) {
      const safeSearch = String(search)
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"');
      queryParts.push(`search "${safeSearch}"`);
    }

    // FIELDS
    queryParts.push(`fields ${fields}`);

    // WHERE
    if (where) {
      queryParts.push(`where ${where}`);
    }

    // SORT
    // IGDB no permite sort junto con search
    if (sort && !search) {
      queryParts.push(`sort ${sort}`);
    }

    // LIMIT
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
    queryParts.push(`limit ${safeLimit}`);

    // OFFSET
    const safeOffset = Math.max(Number(offset) || 0, 0);
    queryParts.push(`offset ${safeOffset}`);

    // CONSTRUIR APICALYPSE
    const queryStr = queryParts
      .map((part) => `${part};`)
      .join(' ');

    console.log('📤 Consulta IGDB:');
    console.log(queryStr);

    try {
      const response = await axios.post(
        `${this.apiUrl.replace(/\/$/, '')}/${endpoint}`,
        queryStr,
        {
          headers: {
            'Client-ID': this.clientId,
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'text/plain',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        `❌ Error en query a ${endpoint}:`,
        error.response?.data || error.message
      );
      throw error;
    }
  }

  // ==========================================
  // BUSCAR JUEGOS
  // ==========================================

  async searchGames(query, limit = 20) { 
    const fields = [ 
        'id', 
        'name', 
        'cover.image_id', 
        'summary', 
        'first_release_date', 
        'genres.name', 
        'platforms.name', 
        'rating', 
        'total_rating', 
        'aggregated_rating' 
    ].join(','); 
    const cacheKey = `search_${query}_${limit}`; 
    const cached = cache.get(cacheKey); 
    if (cached) { console.log('📦 Respuesta desde caché'); return cached; }

    const results = await this.query( 'games', fields, '', limit, '', query ); 
    const transformed = results.map(game => 
        ({ 
            id: game.id,  
            name: game.name, 
            cover: game.cover?.image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : null, 
            summary: game.summary || 'Sin descripción disponible', 
            releaseDate: game.first_release_date ? new Date( game.first_release_date * 1000 ).getFullYear() : 'TBD', 
            genres: game.genres?.map( genre => genre.name ) || [], 
            platforms: game.platforms?.map( platform => platform.name ) || [], 
            rating: game.total_rating ?? game.rating ?? 0, 
            aggregatedRating: game.aggregated_rating ?? 0 
        })); 
            
        cache.set(cacheKey, transformed); return transformed; 
        }

  // ==========================================
  // OBTENER JUEGO POR ID
  // ==========================================

  async getGameById(id) {

    const fields = [ 
        'id', 
        'name', 
        'cover.image_id', 
        'summary', 
        'first_release_date', 
        'genres.name', 
        'platforms.name', 
        'rating', 
        'total_rating', 
        'aggregated_rating', 
        'websites.url', 
        'involved_companies.company.name', 
        'screenshots.image_id', 
        'videos.video_id', 
        'game_modes.name', 
        'player_perspectives.name' 
    ].join(',');

    const where = `id = ${Number(id)}`;
    
    // Cache
    const cacheKey = `game_${id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const results = await this.query('games', fields, where, 1);
    if (!results || results.length === 0) {
      return null;
    }
    const game = results[0];

    const transformed = {
      id: game.id,
      name: game.name,
      cover: game.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null,
      summary:
        game.summary ||
        'Sin descripción disponible',
      releaseDate:
        game.first_release_date
          ? new Date(
              game.first_release_date * 1000
            ).getFullYear()
          : 'TBD',
      genres:
        game.genres?.map(
          genre => genre.name
        ) || [],
      platforms:
        game.platforms?.map(
          platform => platform.name
        ) || [],
      rating:
        game.total_rating ??
        game.rating ??
        0,
      aggregatedRating:
        game.aggregated_rating ?? 0,
      websites:
        game.websites?.map(
          website => website.url
        ) || [],
      companies:
        game.involved_companies?.map(
          company => company.company?.name
        ).filter(Boolean) || [],
      screenshots:
        game.screenshots?.map(
          screenshot =>
            `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${screenshot.image_id}.jpg`
        ) || [],
      videos:
        game.videos?.map(
          video => video.video_id
        ) || [],
      gameModes:
        game.game_modes?.map(
          mode => mode.name
        ) || [],
      perspectives:
        game.player_perspectives?.map(
          perspective => perspective.name
        ) || []
    };

    cache.set(cacheKey, transformed);
    return transformed;
  }

  // ==========================================
  // Juegos Trending
  // ==========================================
  async getTrendingGames(limit = 5) {
    const cacheKey = `trending_${limit}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log('Trending desde caché');
      return cached;
    }

    // ==========================================
    // Obtener juegos más populares
    // según visitas de IGDB
    // ==========================================
    const popularityFields = ['game_id', 'value', 'popularity_type'].join(',');
    const popularityWhere = 'popularity_type = 1';
    const popularitySort = 'value desc';
    const popularityResults = await this.query(
      'popularity_primitives',
      popularityFields,
      popularityWhere,
      limit,
      popularitySort
    );

    if (!popularityResults || popularityResults.length === 0) {
      return [];
    }

    // Obtener IDs de los juegos
    const gameIds = popularityResults.map(item => item.game_id).filter(Boolean);

    if (gameIds.length === 0) {
      return [];
    }

    // Obtener información de esos juegos
    const gameFields = [
      'id',
      'name',
      'cover.image_id',
      'first_release_date',
      'total_rating',
      'aggregated_rating'
    ].join(',');
    const gameWhere = `id = (${gameIds.join(',')})`;
    const games = await this.query('games', gameFields, gameWhere, limit);

    // Mantener el orden de popularidad
    const popularityMap = new Map(
      popularityResults.map(item => [item.game_id, item.value])
    );

    games.sort((a, b) => {
      const popularityA = popularityMap.get(a.id) ?? 0;
      const popularityB = popularityMap.get(b.id) ?? 0;
      return popularityB - popularityA;
    });

    // Transformar respuesta
    const transformed = games.map(game => ({
      id: game.id,
      name: game.name,
      cover: game.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null,
      releaseDate: game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : 'TBD',
      rating: game.total_rating ?? 0,
      aggregatedRating: game.aggregated_rating ?? 0,
      popularity: popularityMap.get(game.id) ?? 0
    }));

    cache.set(cacheKey, transformed);
    return transformed;
  }

  // ==========================================
  // Juegos mejor valorados
  // ==========================================
  async getTopRatedGames(limit = 5) {
    const fields = [
      'id',
      'name',
      'cover.image_id',
      'first_release_date',
      'total_rating',
      'aggregated_rating'
    ].join(',');

    const cacheKey = `top_rated_${limit}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log('📦 Top Rated desde caché');
      return cached;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const where = `first_release_date < ${currentTimestamp} & total_rating != null`;
    const sort = 'total_rating desc';
    const results = await this.query('games', fields, where, limit, sort);

    const transformed = results.map(game => ({
      id: game.id,
      name: game.name,
      cover: game.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null,
      releaseDate: game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : 'TBD',
      rating: game.total_rating ?? 0,
      aggregatedRating: game.aggregated_rating ?? 0
    }));

    cache.set(cacheKey, transformed);
    return transformed;
  }

  // ==========================================
  // Explorar todos los juegos
  // ==========================================
  async getAllGames(limit = 20, offset = 0, genreId = null, year = null) {
    const fields = [
      'id',
      'name',
      'cover.image_id',
      'first_release_date',
      'genres.name',
      'platforms.name',
      'total_rating',
      'aggregated_rating'
    ].join(',');

    // CACHE
    const cacheKey = `all_games_${limit}_${offset}_${genreId || 'all'}_${year || 'all'}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log('📦 All Games desde caché');
      return cached;
    }

    // Filtro de fecha/año
    let where = `first_release_date != null`;
    if (year && !isNaN(year) && year > 1970 && year < 2100) {
      const startTimestamp = Math.floor(new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(`${year}-12-31T23:59:59Z`).getTime() / 1000);
      where += ` & first_release_date >= ${startTimestamp} & first_release_date <= ${endTimestamp}`;
    } else {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      where += ` & first_release_date < ${currentTimestamp}`;
    }

    // Filtro de genero
    if (genreId !== null) {
      const parsedGenreId = Number(genreId);

      if (!Number.isInteger(parsedGenreId) || parsedGenreId <= 0) {
        throw new Error('ID de género inválido');
      }

      where += ` & genres = ${parsedGenreId}`;
    }

    // orden
    const sort = 'first_release_date desc';

    // Consulta
    const results = await this.query('games', fields, where, limit, sort, '', offset);

    // Transformar respuesta
    const transformed = results.map((game) => ({
      id: game.id,
      name: game.name,
      cover: game.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null,
      releaseDate: game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : 'TBD',
      genres: game.genres?.map((genre) => genre.name) || [],
      platforms: game.platforms?.map((platform) => platform.name) || [],
      rating: game.total_rating ?? 0,
      aggregatedRating: game.aggregated_rating ?? 0
    }));

    cache.set(cacheKey, transformed);
    return transformed;
  }

  // Obtener géneros 
  async getGenres() {
    const cacheKey = 'genres';
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log('Géneros desde caché');
      return cached;
    }

    const fields = ['id', 'name', 'slug'].join(',');
    const results = await this.query('genres', fields, '', 50, 'name asc');

    const transformed = results.map((genre) => ({
      id: genre.id,
      name: genre.name,
      slug: genre.slug
    }));

    cache.set(cacheKey, transformed);
    return transformed;
  }
}

module.exports = new IGDBService();
