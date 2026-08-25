import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./UserDashboard.css";

import { updateProfile, updateAvatar, getFavorites, deleteFavorite, getLibrary } from "../../../api/userApi";

export default function UserDashboard() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [favorites, setFavorites] = useState([]);
  const [library, setLibrary] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '/uploads/avatars/default-avatar.png');

  const [formData, setFormData] = useState({
    nickname: user?.nickname || "",
    name: user?.name || user?.nombre || "",
    email: user?.email || "",
    password: "********"
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getFavorites().then(setFavorites).catch(console.error);
    setAvatarPreview(user.avatar || '/uploads/avatars/default-avatar.png');
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getLibrary().then(setLibrary).catch(console.error);
  }, [user]);

  if (!user) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));

    const upload = async () => {
      try {
        const response = await updateAvatar(file);
        const updatedUser = { ...user, avatar: response.avatar_url };
        login(updatedUser);
        alert('✅ Avatar actualizado con éxito');
      } catch (error) {
        console.error('Error al subir avatar:', error);
        alert(`❌ Error: ${error.message}`);
        setAvatarPreview(user?.avatar || '/uploads/avatars/default-avatar.png');
      }
    };
    
    upload();
    e.target.value = '';
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        const res = await updateProfile(user.id || user.id_usuario, {
          name: formData.name,
          nickname: formData.nickname,
          password: formData.password
        });

        if (res.user) {
          login({ ...user, ...res.user });
        }
        alert("✅ Perfil actualizado con éxito");
      } catch (error) {
        alert("❌ Error al actualizar: " + error.message);
        return;
      }
    }
    setIsEditing(!isEditing);
  };

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
              
              <div 
                className="ud-avatar-container position-relative d-inline-block"
                onClick={handleAvatarClick}
                style={{ cursor: 'pointer' }}
              >
                <img 
                  src={avatarPreview} 
                  className="ud-avatar" 
                  alt="avatar" 
                  style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                     style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '50%', opacity: 0, transition: 'opacity 0.2s' }}
                     onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                     onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                  <i className="bi bi-camera-fill text-white fs-4"></i>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                hidden
              />

              <h4 className="mt-3 text-white">{user.nickname}</h4>
              <p className="ud-email text-muted">{user.email}</p>

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
                    value={formData.password}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <label>Contraseña</label>
                  <button
                    type="button"
                    className="ud-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
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
                  <p className="text-center text-muted py-4">No tienes juegos favoritos agregados.</p>
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

                      <img src={game.imagen_url || '/nulls/null-user-img.png'} alt={game.nombre} className="img-fluid" />

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
                  <p className="text-center text-muted py-4">No has adquirido juegos aún. ¡Explora el catálogo!</p>
                ) : (
                  library.map((game) => (
                  <div key={game.id_juego} className="ud-game-card">
                    <img src={game.imagen_url || '/nulls/null-user-img.png'} alt={game.nombre} />
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
    </>
  );
}