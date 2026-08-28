import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import AvatarModal from "../../../components/AvatarModal/AvatarModal";
import { getAvatarUrl, generateSVGPlaceholder } from "../../../utils/avatarUtils";
import "./UserDashboard.css";

import { updateProfile, updateAvatar, getFavorites, deleteFavorite, getLibrary } from "../../../api/userApi";

// Componente principal para el panel de control del usuario.
export default function UserDashboard() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Estados locales para favoritos, biblioteca, edición de datos y galería de avatares
  const [favorites, setFavorites] = useState([]);
  const [library, setLibrary] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para el modal de avatar DiceBear
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  
  const [avatarPreview, setAvatarPreview] = useState(getAvatarUrl(user));

  // Estado del formulario con la información personal del usuario
  const [formData, setFormData] = useState({
    nickname: user?.nickname || "",
    name: user?.name || user?.nombre || "",
    email: user?.email || "",
    password: ""
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Carga la lista de juegos favoritos y actualiza la vista previa del avatar al detectar cambios en el usuario
  useEffect(() => {
    if (!user) return;
    setFormData({
      nickname: user.nickname || "",
      name: user.name || user.nombre || "",
      email: user.email || "",
      password: ""
    });
    getFavorites().then(setFavorites).catch(console.error);
    setAvatarPreview(getAvatarUrl(user));
  }, [user]);

  // Carga los juegos adquiridos en la biblioteca del usuario
  useEffect(() => {
    if (!user) return;
    getLibrary().then(setLibrary).catch(console.error);
  }, [user]);

  if (!user) return null;

  // Abre el modal de la galería de avatares DiceBear
  const handleOpenAvatarModal = () => {
    setIsAvatarModalOpen(true);
  };

  // Guarda el avatar seleccionado de DiceBear y sincroniza con el AuthContext y la BD
  const handleSaveAvatar = async (selectedAvatarUrl) => {
    setSavingAvatar(true);
    try {
      const response = await updateAvatar(selectedAvatarUrl);
      const newAvatarUrl = response.avatar_url || selectedAvatarUrl;
      
      const updatedUser = {
        ...user,
        avatar: newAvatarUrl,
        avatar_url: newAvatarUrl
      };
      
      login(updatedUser);
      setAvatarPreview(newAvatarUrl);
      setIsAvatarModalOpen(false);
      alert('Avatar actualizado con éxito');
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      alert(`Error al actualizar avatar: ${error.message}`);
    } finally {
      setSavingAvatar(false);
    }
  };

  // Alterna entre el modo de edición y lectura. Si se está editando, guarda los cambios en el servidor
  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        const payload = {
          name: formData.name,
          nickname: formData.nickname
        };

        // Solo incluir la contraseña si el usuario escribió una nueva
        if (formData.password && formData.password.trim() !== "") {
          if (formData.password.trim().length < 4) {
            alert("La contraseña debe tener al menos 4 caracteres.");
            return;
          }
          payload.password = formData.password.trim();
        }

        const res = await updateProfile(user.id || user.id_usuario, payload);

        if (res.user) {
          login({ ...user, ...res.user });
        }
        setFormData(prev => ({ ...prev, password: "" }));
        setShowPassword(false);
        alert("Perfil actualizado con éxito");
      } catch (error) {
        alert("Error al actualizar: " + error.message);
        return;
      }
    }
    setIsEditing(!isEditing);
  };

  // Elimina un juego de los favoritos del usuario mediante la API y actualiza la lista local
  const handleDeleteFavorite = async (id_juego) => {
    try {
      await deleteFavorite(id_juego);
      setFavorites(prev => prev.filter(game => Number(game.id_juego) !== Number(id_juego)));
    } catch (error) {
      console.error("Error eliminando favorito:", error);
      alert("No se pudo eliminar el favorito");
    }
  };

  return (
    <>
      <Navbar user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="user-dashboard container-fluid py-4">
        <div className="row g-4">
          {/* PERFIL */}
          <div className="col-xl-3 col-lg-4 col-md-12">
            <div className="ud-card ud-profile">
              
              {/* Avatar interactivo */}
              <div 
                className="ud-avatar-container position-relative d-inline-block"
                onClick={handleOpenAvatarModal}
                title="Haz clic para cambiar tu avatar de DiceBear"
                style={{ cursor: 'pointer' }}
              >
                <img 
                  src={avatarPreview} 
                  className="ud-avatar" 
                  alt="avatar" 
                  style={{ width: 130, height: 130, borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => {
                    // En caso de error al cargar la imagen, genera un placeholder SVG con la inicial
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = generateSVGPlaceholder(user.nickname || user.nombre || 'U');
                  }}
                />
                
                {/* Overlay flotante */}
                <div 
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                  style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', opacity: 0, transition: 'opacity 0.25s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                >
                  <i className="bi bi-palette-fill text-white fs-4"></i>
                  <small className="text-white fw-bold" style={{ fontSize: '0.75rem' }}>Cambiar Avatar</small>
                </div>
              </div>

              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 mt-1"
                  onClick={handleOpenAvatarModal}
                >
                  <i className="bi bi-palette-fill me-1"></i> Cambiar Avatar
                </button>
              </div>

              <h4 className="mt-3 text-white">{user.nickname}</h4>
              <p className="ud-email text-white">{user.email}</p>

              <div className="ud-form mt-4">
                <div className="form-floating mb-3">
                  <input
                    className="form-control ud-input"
                    value={formData.nickname}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, nickname: e.target.value })
                    }
                  />
                  <label>Nickname</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    className="form-control ud-input"
                    value={formData.name}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <label>Nombre</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    className="form-control ud-input"
                    value={formData.email}
                    disabled={true}
                  />
                  <label>Email</label>
                </div>

                <div className="form-floating position-relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control ud-input"
                    placeholder="Nueva contraseña (opcional)"
                    value={formData.password}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    style={{ paddingRight: (isEditing && formData.password.length > 0) ? '45px' : undefined }}
                  />
                  <label>Contraseña {isEditing ? "(opcional)" : ""}</label>
                  {isEditing && formData.password.length > 0 && (
                    <button
                      type="button"
                      className="btn border-0 text-secondary position-absolute top-50 end-0 translate-middle-y me-2"
                      onClick={(e) => {
                        // Alterna el estado de visibilidad de la contraseña
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPassword(prev => !prev);
                      }}
                      style={{ zIndex: 10, cursor: 'pointer', background: 'transparent' }}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash-fill text-warning" : "bi-eye-fill text-light"} fs-5`} />
                    </button>
                  )}
                </div>

                <button
                  className={`ud-btn-${isEditing ? "primary" : "outline"} w-100`}
                  onClick={handleEditToggle}
                >
                  {isEditing ? "Guardar cambios" : "Editar información"}
                </button>
              </div>
            </div>
          </div>

          {/* CONTENIDO */}
          <div className="col-xl-9 col-lg-8 col-md-12">
            {/* FAVORITOS */}
            <div className="ud-card mb-4">
              <h5 className="ud-section-title">
                <i className="bi bi-heart-fill text-danger me-2"></i> Mis Favoritos
              </h5>

              <div className="ud-games-grid">
                { favorites.length === 0 ? (
                  <p className="text-center text-white py-4">No tienes juegos favoritos agregados.</p>
                ) : (
                  favorites.map((game) => (
                    <div key={game.id_juego} className="ud-game-card position-relative">
                      <button 
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 shadow-sm delete-favorite-btn"
                        title="Eliminar de favoritos"
                        onClick={() => handleDeleteFavorite(game.id_juego)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>

                      <img 
                        src={game.imagen_url || '/nulls/placeholder-game.svg'} 
                        alt={game.nombre} 
                        className="img-fluid"
                        onError={(e) => {
                          // Si falla la carga de la imagen del juego, usa un placeholder por defecto
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/nulls/placeholder-game.svg";
                        }}
                      />

                      <div className="ud-game-info p-2">
                        <h6 className="text-truncate text-white">{game.nombre}</h6>
                        <button className="ud-btn-primary w-100 mt-2" onClick={() => navigate('/game/' + game.id_juego)}>
                          Ver Juego
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* BIBLIOTECA */}
            <div className="ud-card">
              <h5 className="ud-section-title">
                <i className="bi bi-controller me-2 text-info"></i> Mi Biblioteca
              </h5>

              <div className="ud-games-grid">
                { library.length === 0 ? (
                  <p className="text-center text-white py-4">No has adquirido juegos aún. ¡Explora el catálogo!</p>
                ) : (
                  library.map((game) => (
                  <div key={game.id_juego} className="ud-game-card">
                    <img 
                      src={game.imagen_url || '/nulls/placeholder-game.svg'} 
                      alt={game.nombre} 
                      onError={(e) => {
                        // Si falla la carga de la imagen del juego, usa un placeholder por defecto
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/nulls/placeholder-game.svg";
                      }}
                    />
                    <div className="ud-game-info p-2">
                      <h6 className="text-white text-truncate">{game.nombre}</h6>
                      <small className="text-muted d-block mb-2">Adquirido: {new Date(game.adquirido_en).toLocaleDateString()}</small>
                      <button className="btn btn-success btn-sm w-100">
                        <i className="bi bi-play-fill me-1"></i> Jugar
                      </button>
                    </div>
                  </div>
                )))}  
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Galería de Avatares DiceBear */}
      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={avatarPreview}
        onSave={handleSaveAvatar}
        loading={savingAvatar}
      />
    </>
  );
}