import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getNotas, createNota, updateNota, deleteNota } from '../services/notas';
import { Loader2, Plus, Trash2, Save, FileText, CheckCircle2 } from 'lucide-react';

// Un parseador extremadamente básico para visualizar Markdown (negritas, cursivas, listas, encabezados)
const parseMarkdown = (text) => {
  if (!text) return '';
  let html = text
    .replace(/^(#{1,6})\s+(.*)$/gm, (m, h, content) => `<h${h.length} class="font-bold text-slate-800 my-2 text-${7-h.length}xl">${content}</h${h.length}>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\s*-\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>');
  
  return html.replace(/\n/g, '<br/>');
};

export default function Notas() {
  const [notas, setNotas] = useState([]);
  const [activeNota, setActiveNota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const textareaRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getNotas();
      setNotas(data.notas || data || []);
    } catch (err) {
      console.error("Error al cargar notas:", err);
      setErrorMsg("Error al cargar las notas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectNota = (nota) => {
    setActiveNota(nota);
    setTitulo(nota.titulo || '');
    // El backend requería JSON, extraemos el texto
    setContenido(nota.contenido?.text || '');
    setPreviewMode(false);
    setErrorMsg('');
    setSaveMsg('');
    setIsEditing(true);
  };

  const handleNew = () => {
    setActiveNota(null);
    setTitulo('');
    setContenido('');
    setPreviewMode(false);
    setErrorMsg('');
    setSaveMsg('');
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!titulo.trim()) {
      setErrorMsg("El título es obligatorio.");
      return;
    }
    
    setSaving(true);
    setSaveMsg('');
    setErrorMsg('');
    try {
      const payload = { 
        titulo, 
        contenido: { text: contenido },
        color: activeNota?.color || 'blue'
      };
      
      if (activeNota && activeNota.id) {
        await updateNota(activeNota.id, payload);
        setSaveMsg('Nota actualizada correctamente.');
        await loadData();
      } else {
        await createNota(payload);
        setSaveMsg('Nueva nota creada.');
        
        // Recargar y seleccionar la nota recién creada (asumiendo que es la última o coincidiendo por título)
        const data = await getNotas();
        const arr = data.notas || data || [];
        setNotas(arr);
        
        // Buscar la nota recién creada (el backend suele añadirla al final o podemos buscar por título)
        const newlyCreated = arr.find(n => n.titulo === titulo && n.contenido?.text === contenido) || arr[arr.length - 1];
        if (newlyCreated) setActiveNota(newlyCreated);
        
        return; 
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al guardar la nota.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("¿Eliminar esta nota?")) return;
    try {
      await deleteNota(id);
      if (activeNota?.id === id) {
        setIsEditing(false);
        setActiveNota(null);
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Interceptar Ctrl+S o Cmd+S
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50">
      {/* Sidebar de Notas */}
      <div className="w-1/3 max-w-sm bg-white border-r border-slate-200 flex flex-col h-full">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Mis Notas</h2>
          <button 
            onClick={handleNew}
            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            title="Nueva Nota"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-blue-700 animate-spin" /></div>
          ) : notas.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">No hay notas guardadas.</p>
          ) : (
            notas.map(nota => (
              <div 
                key={nota.id}
                onClick={() => handleSelectNota(nota)}
                className={`p-4 rounded-xl cursor-pointer border transition-all group ${activeNota?.id === nota.id ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-200'}`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800 truncate pr-2">{nota.titulo}</h4>
                  <button 
                    onClick={(e) => handleDelete(nota.id, e)}
                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {nota.contenido?.text ? nota.contenido.text.substring(0, 50) : 'Sin contenido...'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área de Edición */}
      {!isEditing ? (
        <div className="flex-1 flex flex-col h-full bg-slate-50 justify-center items-center relative select-none">
          <FileText className="w-20 h-20 text-slate-200 mb-6" />
          <h3 className="text-2xl font-bold text-slate-400">Ninguna nota seleccionada</h3>
          <p className="text-slate-400 mt-2 font-medium">Selecciona una nota del panel lateral o crea una nueva.</p>
          <button 
            onClick={handleNew} 
            className="mt-8 flex items-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" /> Crear Primera Nota
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full bg-white relative">
          <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center">
            <input 
              type="text" 
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título de la nota..."
              className="text-2xl font-bold text-slate-800 outline-none bg-transparent w-2/3 select-auto"
            />
            
            <div className="flex items-center gap-4 select-none">
              <button 
                onClick={() => setPreviewMode(!previewMode)}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                {previewMode ? 'Editar Markdown' : 'Vista Previa'}
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar (Ctrl+S)
              </button>
            </div>
          </div>

          {errorMsg && <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-sm text-sm font-medium z-10">{errorMsg}</div>}
          {saveMsg && <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 px-4 py-2 rounded-lg shadow-sm text-sm font-medium z-10 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> {saveMsg}</div>}

          <div className="flex-1 overflow-y-auto p-8">
            {previewMode ? (
              <div 
                className="prose prose-slate max-w-none text-slate-700 select-auto"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(contenido) || '<span class="text-slate-400 italic">Nada que previsualizar...</span>' }}
              />
            ) : (
              <textarea
                ref={textareaRef}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe aquí usando Markdown...&#10;- Negritas: **texto**&#10;- Cursivas: *texto*&#10;- Títulos: # Título"
                className="w-full h-full resize-none outline-none text-slate-700 text-lg leading-relaxed bg-transparent select-auto"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
