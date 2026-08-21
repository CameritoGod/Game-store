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
    search = ''
  ) {
    const token = await this.getAccessToken();
    let queryParts = [];

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
    if (sort) {
      queryParts.push(`sort ${sort}`);
    }
    // LIMIT
    queryParts.push(`limit ${Math.min(Number(limit) || 20, 50)}`);

    // APICalypse
    const queryStr = queryParts
      .map(part => `${part};`)
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
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'text/plain'
          }
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
     /* * IMPORTANTE: * 
     * IGDB NO permite utilizar `sort` junto con `search`. * 
     * Cuando usamos: * 
     * * search "zelda"; * 
     * * IGDB ordena automáticamente por relevancia. * 
     * * Por eso dejamos sort vacío. */ 
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
      popularity:
        game.popularity ?? 0,
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
}

module.exports = new IGDBService();
