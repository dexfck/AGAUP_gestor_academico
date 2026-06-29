import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMaterias, deleteMateria, createMateria } from '../services/materias';
import { getInscripciones, createInscripcion, deleteInscripcion } from '../services/inscripciones';
import { Trash2, Plus, Loader2, X, GraduationCap, CheckCircle2, Book } from 'lucide-react';

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Modals
  const [isMateriaModalOpen, setIsMateriaModalOpen] = useState(false);
  const [isInscripcionModalOpen, setIsInscripcionModalOpen] = useState(false);
  
  // Forms
  const [newMateria, setNewMateria] = useState({ id: '', nombre: '', creditos: 3 });
  const [newInscripcion, setNewInscripcion] = useState({ materia_id: '', cuatrimestre: 1 });

  const loadData = async () => {
    setLoading(true);
    try {
      const [matData, insData] = await Promise.all([getMaterias(), getInscripciones()]);
      const allMaterias = matData.materias || matData || [];
      const insList = insData.inscripciones || insData || [];
      
      const currentUser = JSON.parse(localStorage.getItem('usuario') || '{}');
      const key = `mis_materias_${currentUser.matricula}`;
      const misMaterias = JSON.parse(localStorage.getItem(key) || '[]');
      
      const filteredMaterias = allMaterias.filter(mat => 
        misMaterias.includes(mat.id) || insList.some(ins => ins.materia_id === mat.id)
      );
      
      setMaterias(filteredMaterias);
      setInscripciones(insList);
    } catch (err) {
      console.error("Fallo al cargar datos:", err);
      setErrorMsg('Error al cargar el catálogo de materias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Materias Handlers
  const handleCreateMateria = async (e) => {
    e.preventDefault();
    if (!newMateria.id || !newMateria.nombre) return;
    try {
      await createMateria(newMateria);
      
      const currentUser = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (currentUser.matricula) {
        const key = `mis_materias_${currentUser.matricula}`;
        const misMaterias = JSON.parse(localStorage.getItem(key) || '[]');
        if (!misMaterias.includes(newMateria.id)) {
          misMaterias.push(newMateria.id);
          localStorage.setItem(key, JSON.stringify(misMaterias));
        }
      }

      setIsMateriaModalOpen(false);
      setNewMateria({ id: '', nombre: '', creditos: 3 });
      loadData();
    } catch (err) {
      setErrorMsg(`Error al crear materia: ${err.message}`);
    }
  };

  const handleDeleteMateria = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta materia del sistema? Esto podría afectar a otros usuarios si comparten catálogo.")) return;
    try {
      await deleteMateria(id);
      
      const currentUser = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (currentUser.matricula) {
        const key = `mis_materias_${currentUser.matricula}`;
        let misMaterias = JSON.parse(localStorage.getItem(key) || '[]');
        misMaterias = misMaterias.filter(mId => mId !== id);
        localStorage.setItem(key, JSON.stringify(misMaterias));
      }

      loadData();
    } catch (err) {
      if (err.response?.status === 500) {
        setErrorMsg("No se puede eliminar la materia porque tiene inscripciones o calificaciones asociadas.");
      } else {
        setErrorMsg("Error al eliminar la materia.");
      }
    }
  };

  // Inscripciones Handlers
  const openInscripcionModal = (materia_id) => {
    setNewInscripcion({ materia_id, cuatrimestre: 1 });
    setIsInscripcionModalOpen(true);
  };

  const handleInscribir = async (e) => {
    e.preventDefault();
    try {
      await createInscripcion(newInscripcion.materia_id, newInscripcion.cuatrimestre);
      setIsInscripcionModalOpen(false);
      loadData();
    } catch (err) {
      setErrorMsg("Error al inscribir materia.");
    }
  };

  const handleRetirar = async (inscripcionId) => {
    if (!window.confirm("¿Retirar tu inscripción de esta materia?")) return;
    try {
      await deleteInscripcion(inscripcionId);
      loadData();
    } catch (err) {
      setErrorMsg("Error al retirar la inscripción.");
    }
  };

  return (
    <div className="p-8 relative select-none">
      <div className="sticky top-0 z-10 bg-slate-50 pt-8 pb-4 -mt-8 -mx-8 px-8 flex justify-between items-center mb-6 border-b border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800">Materias Inscritas</h2>
        <button
          onClick={() => setIsMateriaModalOpen(true)}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar al Catálogo
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100 flex justify-between items-center">
          {errorMsg}
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Modal Nueva Materia */}
      {isMateriaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Registrar Materia</h3>
              <button onClick={() => setIsMateriaModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateMateria} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código (ID)</label>
                <input type="text" required placeholder="Ej. MAT-101" value={newMateria.id} onChange={(e) => setNewMateria({ ...newMateria, id: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 uppercase select-auto" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input type="text" required value={newMateria.nombre} onChange={(e) => setNewMateria({ ...newMateria, nombre: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 select-auto" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Créditos</label>
                <input type="number" min="1" max="10" required value={newMateria.creditos} onChange={(e) => setNewMateria({ ...newMateria, creditos: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 select-auto" />
              </div>
              <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded-lg font-medium hover:bg-blue-800">Guardar Materia</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal Inscribir Materia */}
      {isInscripcionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">Confirmar Inscripción</h3>
              <button onClick={() => setIsInscripcionModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleInscribir} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cuatrimestre</label>
                <input type="number" min="1" max="15" required value={newInscripcion.cuatrimestre} onChange={(e) => setNewInscripcion({...newInscripcion, cuatrimestre: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700">Inscribirme</button>
            </form>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        </div>
      ) : materias.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">No hay materias en el catálogo del sistema.</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {materias.map((mat, index) => {
            const inscripcion = inscripciones.find(ins => ins.materia_id === mat.id);
            const isInscrito = !!inscripcion;

            return (
              <motion.div
                key={mat.id || index}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between ${isInscrito ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-800">{mat.nombre}</h3>
                      {isInscrito && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> INSCRITO
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                      <span className="font-mono text-slate-400">{mat.id}</span>
                      <span className="flex items-center gap-1"><Book className="w-3.5 h-3.5" /> {mat.creditos} Créditos</span>
                      {isInscrito && <span className="text-emerald-700 font-bold">Cuatrimestre {inscripcion.cuatrimestre}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isInscrito ? (
                    <button
                      onClick={() => handleRetirar(inscripcion.id)}
                      className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                    >
                      Retirar Inscripción
                    </button>
                  ) : (
                    <button
                      onClick={() => openInscripcionModal(mat.id)}
                      className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4" /> Inscribirse
                    </button>
                  )}
                  
                  <div className="w-px h-6 bg-slate-200 mx-2"></div>
                  
                  <button
                    onClick={() => handleDeleteMateria(mat.id)}
                    className="text-slate-400 hover:text-red-500 p-2 rounded-lg transition-colors"
                    title="Eliminar Materia del Catálogo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
