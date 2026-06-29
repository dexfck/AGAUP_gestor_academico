import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getContactos, createContacto, deleteContacto, updateContacto } from '../services/contactos';
import { Loader2, Plus, X, Search, Mail, Link as LinkIcon, Trash2, Phone, Briefcase, Edit2 } from 'lucide-react';

export default function Contactos() {
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'Profesor', // Profesor, Compañero, Asesor, Otro
    correo: '',
    enlace: '',
    telefono: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getContactos();
      setContactos(data.contactos || data || []);
    } catch (err) {
      console.error("Error al cargar contactos:", err.response?.data || err.message);
      setErrorMsg("Ocurrió un error al cargar los contactos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.correo && !formData.enlace) {
      setErrorMsg("Debe agregar al menos un correo o un enlace.");
      return;
    }
    
    try {
      if (editingId) {
        await updateContacto(editingId, formData);
      } else {
        await createContacto(formData);
      }
      setIsModalOpen(false);
      setFormData({ nombre: '', tipo: 'Profesor', correo: '', enlace: '', telefono: '' });
      setEditingId(null);
      loadData();
    } catch (err) {
      console.error("Error guardando contacto:", err.response?.data || err.message);
      const errMsg = err.response?.data?.error || err.message;
      setErrorMsg(`Error: ${errMsg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este contacto?")) return;
    try {
      await deleteContacto(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (contacto = null) => {
    if (contacto) {
      setEditingId(contacto.id);
      setFormData({
        nombre: contacto.nombre,
        tipo: contacto.tipo,
        correo: contacto.correo || '',
        enlace: contacto.enlace || '',
        telefono: contacto.telefono || ''
      });
    } else {
      setEditingId(null);
      setFormData({ nombre: '', tipo: 'Profesor', correo: '', enlace: '', telefono: '' });
    }
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const filteredContactos = contactos.filter(c => {
    const match = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  c.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    return match;
  });

  return (
    <div className="p-8 relative select-none">
      <div className="sticky top-0 z-10 bg-slate-50 pt-8 pb-4 -mt-8 -mx-8 px-8 flex justify-between items-center mb-6 border-b border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800">Directorio de Contactos</h2>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Contacto
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text"
          placeholder="Buscar por nombre o tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 shadow-sm select-auto"
        />
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {errorMsg}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Editar Contacto' : 'Añadir Contacto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" required placeholder="Ej. Dr. Alan Turing"
                  value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 select-auto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol / Tipo</label>
                <select 
                  required
                  value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                >
                  <option value="Profesor">Profesor</option>
                  <option value="Compañero">Compañero</option>
                  <option value="Asesor">Asesor</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico (Opcional)</label>
                <input 
                  type="email" placeholder="correo@universidad.edu"
                  value={formData.correo} onChange={(e) => setFormData({...formData, correo: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 select-auto"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enlace / Web (Opcional)</label>
                <input 
                  type="url" placeholder="https://..."
                  value={formData.enlace} onChange={(e) => setFormData({...formData, enlace: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 select-auto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono (Opcional)</label>
                <input 
                  type="tel" placeholder="+1 234 567 890"
                  value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 select-auto"
                />
              </div>

              <button type="submit" className="w-full bg-blue-700 text-white py-2 mt-4 rounded-lg font-medium hover:bg-blue-800">
                Guardar Contacto
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        </div>
      ) : filteredContactos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">No hay contactos para mostrar.</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {filteredContactos.map((contacto, idx) => (
            <motion.div 
              key={contacto.id || idx}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md transition-shadow relative group"
            >
              
              <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-lg">
                  {getInitials(contacto.nombre)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 truncate" title={contacto.nombre}>{contacto.nombre}</h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      <Briefcase className="w-3 h-3" /> {contacto.tipo}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                    {contacto.correo && (
                      <div className="flex items-center gap-1.5 truncate" title={contacto.correo}>
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <a href={`mailto:${contacto.correo}`} className="hover:text-blue-600 transition-colors select-auto">{contacto.correo}</a>
                      </div>
                    )}
                    {contacto.telefono && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <a href={`tel:${contacto.telefono}`} className="hover:text-blue-600 transition-colors select-auto">{contacto.telefono}</a>
                      </div>
                    )}
                    {contacto.enlace && (
                      <div className="flex items-center gap-1.5 truncate" title={contacto.enlace}>
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <a href={contacto.enlace} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors truncate max-w-[200px] select-auto">{contacto.enlace}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto justify-end border-t md:border-none pt-4 md:pt-0 border-slate-100">
                <button 
                  onClick={() => openModal(contacto)}
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  title="Editar Contacto"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
                <button 
                  onClick={() => handleDelete(contacto.id)}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-lg transition-colors"
                  title="Eliminar Contacto"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
