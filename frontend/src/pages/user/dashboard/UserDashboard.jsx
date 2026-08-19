import { useEffect, useState, useRef } from "react"; // ✅ Agrega useRef
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./UserDashboard.css";

import { updateProfile, updateAvatar, getFavorites, deleteFavorite, getPurchases } from "../../../api/userApi"; // ✅ Importa updateAvatar

export default function UserDashboard() {
  const { user, login } = useAuth(); // ✅ Asegúrate de que login esté disponible para actualizar contexto
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // ✅ Referencia para el input file

  const [favorites, setFavorites] = useState([]);
  const [library, setLibrary] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // ✅ Estado para preview del avatar
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '/uploads/avatars/default-avatar.png');

  const [formData, setFormData] = useState({
    nickname: user?.nickname || "",
    name: user?.name || "",
    email: user?.email || "",
    password: "********"
  });
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getFavorites().then(setFavorites);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvatarPreview(user.avatar || '/uploads/avatars/default-avatar.png');
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getPurchases().then(setLibrary);
  }, [user]);

  if (!user) return null;

  // ✅ Manejar clic en "Cambiar foto"
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // ✅ Manejar selección de archivo
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validaciones básicas
    if (!file.type.match('image.*')) {
      alert('Solo se permiten imágenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB');
      return;
    }

    // Preview local inmediato
    setAvatarPreview(URL.createObjectURL(file));

    // Subir al backend
    const upload = async () => {
      try {
        const response = await updateAvatar(file);
        
        // ✅ Actualizar contexto de auth para que el navbar muestre la nueva foto
        const updatedUser = { ...user, avatar: response.avatar_url };
        login(updatedUser); // Esto actualiza localStorage y contexto
        
        alert('✅ Avatar actualizado');
      } catch (error) {
        console.error('Error al subir avatar:', error);
        alert(`❌ Error: ${error.message}`);
        // Revertir preview si falla
        setAvatarPreview(user?.avatar || '/uploads/avatars/default-avatar.png');
      }
    };
    
    upload();
    
    // Limpiar input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      try {
        await updateProfile(user.id, formData);
        alert("Perfil actualizado con éxito");
      } catch (error) {
        alert("Error al actualizar: " + error.message);
        return;
      }
    }
    setIsEditing(!isEditing);
  };

  const handleDeleteFavorite = async (id_juego) => {
    try {
      await deleteFavorite(id_juego);
      setFavorites(prev => prev.filter(game => game.id_juego !== id_juego));
    } catch (error) {
      console.error("Error eliminando favorito:", error);
      alert("No se pudo eliminar el favorito");
    }
  };

  return (
    <>
    <Navbar user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
    <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

    <div className="user-dashboard container-fluid">
      <div className="row g-4">
        {/* PERFIL */}
        <div className="col-xl-3 col-lg-4 col-md-12">
          <div className="ud-card ud-profile">
            
            {/* ✅ Avatar con clic para cambiar */}
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
              {/* Overlay de edición */}
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                   style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '50%', opacity: 0, transition: 'opacity 0.2s' }}
                   onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                   onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
              >
                <i className="bi bi-camera-fill text-white fs-4"></i>
              </div>
            </div>
            
            {/* ✅ Input file oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              hidden
            />

            <h4 className="mt-3">{user.nickname}</h4>
            <p className="ud-email">{user.email}</p>

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
                  disabled={!isEditing}
                />
                <label>Email</label>
              </div>

              <div className="form-floating position-relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control ud-input"
                  value={formData.password}
                  disabled={!isEditing}
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
                onClick={handleEditToggle} // Llama a la función asíncrona
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
              <i className="bi bi-heart-fill text-danger"></i> Favoritos
            </h5>

            <div className="ud-games-grid">
              { favorites.length === 0 ? (
                <p className="text-center">No tienes juegos favoritos.</p>
              ) : (
                favorites.map((game) => (
                  <div key={game.id_juego} className="ud-game-card position-relative">
                    {/* Botón Flotante */}
                    <button 
                      className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 shadow-sm delete-favorite-btn"
                      title="Eliminar de favoritos"
                      onClick={() => handleDeleteFavorite(game.id_juego)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>

                    <img src={game.imagen_url} alt={game.nombre} className="img-fluid" />

                    <div className="ud-game-info p-2">
                      <h6 className="text-truncate">{game.nombre}</h6>
                      <button className="ud-btn-primary w-100" onClick={() => navigate('/game/' + game.id_juego)}>
                        Ir al juego
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
              <i className="bi bi-controller"></i> Biblioteca
            </h5>

            <div className="ud-games-grid">
              { library.length === 0 ? (
                <p className="text-center">No tienes juegos en tu biblioteca.</p>
              ) : (
                library.map((game) => (
                <div key={game.id_juego} className="ud-game-card">
                  <img src={game.imagen_url} alt={game.nombre} />
                  <div className="ud-game-info">
                    <h6>{game.nombre}</h6>
                    <button className="ud-btn-primary w-100">
                      Jugar
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