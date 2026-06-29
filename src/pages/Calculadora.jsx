import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMaterias } from '../services/materias';
import { Loader2, Calculator as CalcIcon } from 'lucide-react';

export default function Calculadora() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notasSimuladas, setNotasSimuladas] = useState({});

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        const data = await getMaterias();
        setMaterias(data.materias || data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterias();
  }, []);

  const handleNotaChange = (id, value) => {
    setNotasSimuladas(prev => ({ ...prev, [id]: value }));
  };

  const getLetra = (nota) => {
    if (nota === undefined || nota === '') return '--';
    const n = Number(nota);
    if (n >= 90) return 'A';
    if (n >= 80) return 'B';
    if (n >= 70) return 'C';
    if (n >= 60) return 'D';
    return 'F';
  };

  const calcularGPA = () => {
    const keys = Object.keys(notasSimuladas);
    let validCount = 0;
    let totalPuntos = 0;
    
    keys.forEach(k => {
      const val = notasSimuladas[k];
      if (val !== undefined && val !== '') {
        const num = Number(val);
        if (num >= 90) totalPuntos += 4.0;
        else if (num >= 80) totalPuntos += 3.0;
        else if (num >= 70) totalPuntos += 2.0;
        else if (num >= 60) totalPuntos += 1.0;
        validCount++;
      }
    });
    
    if (validCount === 0) return 'N/A';
    return (totalPuntos / validCount).toFixed(2);
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
          <CalcIcon className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Calculadora de Índice</h2>
      </div>
      
      <p className="text-slate-500 mb-8 max-w-2xl">
        Simula tus promedios ingresando calificaciones hipotéticas en tus materias registradas. Esta herramienta te permite planificar tu índice antes de fin de cuatrimestre.
      </p>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Materia</th>
                  <th className="px-6 py-4">Créditos</th>
                  <th className="px-6 py-4">Calificación (1-100)</th>
                  <th className="px-6 py-4">Letra Esperada</th>
                </tr>
              </thead>
              <tbody>
                {materias.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                      No tienes materias para simular. Ve a "Mis Materias" para agregar una.
                    </td>
                  </tr>
                ) : (
                  materias.map((mat, i) => (
                    <tr key={mat.id || i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{mat.nombre}</td>
                      <td className="px-6 py-4">{mat.creditos}</td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          min="0" max="100" 
                          placeholder="Ej. 85"
                          value={notasSimuladas[mat.id] || ''}
                          onChange={(e) => handleNotaChange(mat.id, e.target.value)}
                          className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none select-auto" 
                        />
                      </td>
                      <td className={`px-6 py-4 font-bold ${notasSimuladas[mat.id] ? 'text-blue-600' : 'text-slate-400'}`}>
                        {getLetra(notasSimuladas[mat.id])}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {materias.length > 0 && (
            <div className="bg-blue-50 p-6 flex justify-between items-center border-t border-blue-100">
              <div>
                <p className="text-blue-900 font-semibold">Índice Proyectado</p>
                <p className="text-sm text-blue-700">Basado en tus calificaciones hipotéticas</p>
              </div>
              <div className="text-4xl font-bold text-blue-700">
                {calcularGPA()}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
