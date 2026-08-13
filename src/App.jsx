import { useState, useEffect } from 'react';
import './index.css';

function App() {
  // Cargar detalles de localStorage
  const [partyDetails, setPartyDetails] = useState(() => {
    const saved = localStorage.getItem('myPartyDetails');
    return saved ? JSON.parse(saved) : { date: '', time: '', location: '' };
  });

  // Cargar invitados de localStorage
  const [guests, setGuests] = useState(() => {
    const saved = localStorage.getItem('myPartyGuests');
    return saved ? JSON.parse(saved) : [];
  });

  const [guestForm, setGuestForm] = useState({ name: '', group: 'Amigos', color: '#10b981' });

  // Guardar en localStorage cada vez que cambien los datos
  useEffect(() => {
    localStorage.setItem('myPartyDetails', JSON.stringify(partyDetails));
  }, [partyDetails]);

  useEffect(() => {
    localStorage.setItem('myPartyGuests', JSON.stringify(guests));
  }, [guests]);

  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!guestForm.name) return;

    const newGuest = {
      id: crypto.randomUUID(),
      name: guestForm.name,
      groupName: guestForm.group,
      color: guestForm.color,
      status: 'Pendiente'
    };

    setGuests([...guests, newGuest]);
    setGuestForm({ ...guestForm, name: '' });
  };

  const toggleStatus = (id) => {
    setGuests(guests.map(g => {
      if (g.id === id) {
        return { ...g, status: g.status === 'Pendiente' ? 'Confirmado' : 'Pendiente' };
      }
      return g;
    }));
  };

  const deleteGuest = (id) => {
    setGuests(guests.filter(g => g.id !== id));
  };

  const confirmedCount = guests.filter(g => g.status === 'Confirmado').length;

  return (
    <>
      <div className="app-container">
        <header className="party-header">
          <h1> Farz Party</h1>
          
          <div className="event-details-form">
            <input 
              type="date" 
              value={partyDetails.date}
              onChange={(e) => setPartyDetails({...partyDetails, date: e.target.value})}
              className="detail-input"
            />
            <input 
              type="time" 
              value={partyDetails.time}
              onChange={(e) => setPartyDetails({...partyDetails, time: e.target.value})}
              className="detail-input"
            />
            <input 
              type="text" 
              placeholder="Ej. Salón en San Miguel de Tucumán..." 
              value={partyDetails.location}
              onChange={(e) => setPartyDetails({...partyDetails, location: e.target.value})}
              className="detail-input location-input"
            />
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
                    <option value="pareja">Pareja</option>
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
            <h2>Mi Lista ({guests.length})</h2>
            {guests.length === 0 ? (
              <p className="empty-state">Empieza a agregar gente para tu fiesta.</p>
            ) : (
              <div className="cards-grid">
                {guests.map((guest) => (
                  <div 
                    key={guest.id} 
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
                        onClick={() => toggleStatus(guest.id)} 
                        className={`status-btn ${guest.status === 'Confirmado' ? 'btn-confirmed' : 'btn-pending'}`}
                      >
                        {guest.status === 'Confirmado' ? '✓ Confirmado' : '? Pendiente'}
                      </button>
                      <button onClick={() => deleteGuest(guest.id)} className="delete-btn">
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