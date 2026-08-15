import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const API_URL = 'https://app-list-birthday21-backend.onrender.com/api/guests';

  const [guests, setGuests] = useState([]);
  const [guestForm, setGuestForm] = useState({ name: '', group: 'Amigos', color: '#10b981' });
  
  // Estado para el filtro
  const [filter, setFilter] = useState('Todos');

  // Comprueba si ya se agregó a la Pareja
  const hasPareja = guests.some(guest => guest.groupName === 'Pareja');

  // Lógica: Cuenta regresiva (Sin segundos)
  const calculateTimeLeft = () => {
    // Fecha: 5 de Septiembre de 2026 a las 21:30 hs
    const difference = +new Date("2026-09-05T21:30:00") - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        días: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  // Cargar invitados
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setGuests(data))
      .catch(err => console.error("Error al cargar invitados:", err));
  }, []);

  // Guardar nuevo invitado
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!guestForm.name) return;

    // Validación: Prevenir que se agregue otra Pareja si ya existe
    if (guestForm.group === 'Pareja' && hasPareja) {
      alert("¡Ya tienes a tu pareja en la lista! ❤️");
      return;
    }

    const newGuest = {
      name: guestForm.name,
      groupName: guestForm.group,
      color: guestForm.color,
      status: 'Pendiente'
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuest)
      });
      const savedGuest = await response.json();
      setGuests([...guests, savedGuest]);
      setGuestForm({ ...guestForm, name: '' });
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // Actualizar estado de Confirmado/Pendiente
  const toggleStatus = async (id) => {
    const guestToUpdate = guests.find(g => g._id === id);
    const newStatus = guestToUpdate.status === 'Pendiente' ? 'Confirmado' : 'Pendiente';

    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setGuests(guests.map(g => g._id === id ? { ...g, status: newStatus } : g));
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  // Eliminar invitado
  const deleteGuest = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setGuests(guests.filter(g => g._id !== id));
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // Lógica del Filtro de Categorías
  const filteredGuests = filter === 'Todos' 
    ? guests 
    : guests.filter(guest => guest.groupName === filter);

  const confirmedCount = guests.filter(g => g.status === 'Confirmado').length;
  
  // Opciones de Filtro
  const categories = ['Todos', 'Pareja', 'Amigos', 'Familia', 'Facultad', 'Trabajo', 'Otro'];

  return (
    <>
      <div className="app-container">
        <header className="party-header">
          <h1>Farz Party</h1>
          
          {/* Cuenta Regresiva */}
          <div className="countdown-wrapper">
            <h3 className="countdown-title">Cuenta Regresiva</h3>
            
            {Object.keys(timeLeft).length ? (
              <div className="countdown-container">
                <div className="time-box"><span>{timeLeft.días}</span>Días</div>
                <div className="time-box"><span>{timeLeft.horas}</span>Hs</div>
                <div className="time-box"><span>{timeLeft.minutos}</span>Min</div>
              </div>
            ) : (
              <div className="countdown-container">
                <h2>¡Llegó el día de la fiesta! 🎉</h2>
              </div>
            )}
          </div>
          
          {/* Detalles de la Fiesta y Mapa */}
          <div className="event-details-fixed">
            <p><span className="icon">📅</span> Sábado 5 de Septiembre</p>
            <p><span className="icon">⏰</span> 21:30 hs</p>
            <div className="location-wrapper">
              <p><span className="icon">📍</span> San Miguel de Tucumán</p>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=San+Miguel+de+Tucuman" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="maps-btn"
              >
                🗺️ Ver ubicación en el mapa
              </a>
            </div>
          </div>

          <div className="stats-bar">
            <div className="stat">Total de Invitados: <strong>{guests.length}</strong></div>
            <div className="stat">Confirmados: <strong className="text-green">{confirmedCount}</strong></div>
            <div className="stat">Pendientes: <strong className="text-orange">{guests.length - confirmedCount}</strong></div>
          </div>
        </header>

        <main className="main-content">
          <section className="form-section">
            <h2>Agregar Invitado</h2>
            <form onSubmit={handleAddGuest} className="guest-form">
              <div className="input-group">
                <label>Nombre y Apellido</label>
                <input 
                  type="text" 
                  placeholder="Ej. Juan Pérez" 
                  value={guestForm.name}
                  onChange={(e) => setGuestForm({...guestForm, name: e.target.value})}
                  required 
                />
              </div>
              
              <div className="input-row">
                <div className="input-group">
                  <label>Grupo / Vínculo</label>
                  <select 
                    value={guestForm.group}
                    onChange={(e) => setGuestForm({...guestForm, group: e.target.value})}
                  >
                    {/* Opción validada: No permite otra Pareja si ya está ocupada */}
                    <option value="Pareja" disabled={hasPareja}>
                      {hasPareja ? 'Pareja (Ya agregada 🔒)' : 'Pareja'}
                    </option>
                    <option value="Amigos">Amigos</option>
                    <option value="Familia">Familia</option>
                    <option value="Facultad">Facultad</option>
                    <option value="Trabajo">Trabajo</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                
                <div className="input-group color-group">
                  <label>Color</label>
                  <input 
                    type="color" 
                    value={guestForm.color}
                    onChange={(e) => setGuestForm({...guestForm, color: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn">Añadir a la lista</button>
            </form>
          </section>

          <section className="list-section">
            <div className="list-header">
              <h2>Mi Lista ({filteredGuests.length})</h2>
              
              {/* Botones de Filtro */}
              <div className="filter-buttons">
                {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setFilter(cat)}
                    className={`filter-btn ${filter === cat ? 'active-filter' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredGuests.length === 0 ? (
              <p className="empty-state">No hay invitados en esta categoría.</p>
            ) : (
              <div className="cards-grid">
                {filteredGuests.map((guest) => (
                  <div 
                    key={guest._id} 
                    className={`guest-card ${guest.status === 'Confirmado' ? 'is-confirmed' : ''}`}
                    style={{ borderTop: `4px solid ${guest.color}` }}
                  >
                    <div className="card-info">
                      <h3>{guest.name}</h3>
                      <span className="group-badge" style={{ backgroundColor: `${guest.color}20`, color: guest.color }}>
                        {guest.groupName}
                      </span>
                    </div>
                    
                    <div className="card-actions">
                      <button 
                        onClick={() => toggleStatus(guest._id)} 
                        className={`status-btn ${guest.status === 'Confirmado' ? 'btn-confirmed' : 'btn-pending'}`}
                      >
                        {guest.status === 'Confirmado' ? '✓ Confirmado' : '? Pendiente'}
                      </button>
                      <button onClick={() => deleteGuest(guest._id)} className="delete-btn">
                        ✖
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-title"> &copy; 2026 Desarrollado por Fabrizio Coronel</p>
          <p className="footer-stack">React Frontend</p>
          <p className="footer-location">San Miguel de Tucumán, Argentina</p>
        </div>
      </footer>
    </>
  );
}

export default App;