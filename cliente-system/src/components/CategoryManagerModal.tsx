import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus, Edit, Trash2, Tag, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  companyId: string;
  userId: string;
  onCategoriesChange: () => void;
}

const COLOR_OPTIONS = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#64748B'
];

export default function CategoryManagerModal({
  isOpen, onClose, categories, companyId, userId, onCategoriesChange
}: CategoryManagerModalProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('product_categories').insert([{
        company_id: companyId,
        name: newName.trim(),
        color: newColor,
        active: true,
        created_by: userId
      }]);
      if (error) throw error;
      setNewName('');
      setNewColor(COLOR_OPTIONS[0]);
      onCategoriesChange();
    } catch (error: any) {
      alert('Erro ao adicionar categoria: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('product_categories')
        .update({ name: editName.trim(), color: editColor })
        .eq('id', editingId);
      if (error) throw error;
      cancelEdit();
      onCategoriesChange();
    } catch (error: any) {
      alert('Erro ao atualizar categoria: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta categoria? Produtos vinculados ficarão sem categoria.')) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('product_categories')
        .update({ active: false })
        .eq('id', id);
      if (error) throw error;
      onCategoriesChange();
    } catch (error: any) {
      alert('Erro ao excluir categoria: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-slate-100">Categorias de Produtos</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de categorias */}
        <div className="space-y-2 mb-4">
          {categories.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Nenhuma categoria cadastrada ainda.</p>
          )}
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-2">
              {editingId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className="w-5 h-5 rounded-full border-2"
                        style={{ backgroundColor: c, borderColor: editColor === c ? '#fff' : 'transparent' }}
                      />
                    ))}
                  </div>
                  <button onClick={saveEdit} disabled={saving} className="p-1 text-green-400 hover:bg-green-500/20 rounded">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={cancelEdit} className="p-1 text-slate-400 hover:bg-slate-700 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-sm text-slate-200">{cat.name}</span>
                  <button onClick={() => startEdit(cat)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Adicionar nova */}
        <form onSubmit={handleAdd} className="border-t border-slate-800 pt-4 space-y-3">
          <label className="block text-sm font-medium text-slate-300">Nova Categoria</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Bebidas"
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
            <button type="submit" disabled={saving || !newName.trim()} className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-1.5">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className="w-6 h-6 rounded-full border-2 transition-all"
                style={{ backgroundColor: c, borderColor: newColor === c ? '#fff' : 'transparent' }}
              />
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
