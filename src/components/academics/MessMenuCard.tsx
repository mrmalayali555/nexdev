'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  Coffee,
  Sun,
  Moon,
  Clock,
  Sparkles,
  Edit2,
  Plus,
  Check,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { DailyMessMenu, DayOfWeek, MessMeal } from '@/lib/academicTypes';
import { triggerHaptic } from '@/lib/haptics';

interface MessMenuCardProps {
  messMenu: DailyMessMenu[];
  onUpdateMessMeal: (
    day: DayOfWeek,
    mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
    items: string[]
  ) => void;
}

const DAYS: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MessMenuCard({ messMenu, onUpdateMessMeal }: MessMenuCardProps) {
  const currentDayName = DAYS[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(currentDayName);

  // Edit modal state
  const [editingMeal, setEditingMeal] = useState<{
    mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
    name: string;
    items: string[];
  } | null>(null);
  const [itemInput, setItemInput] = useState('');

  const activeDayMenu = messMenu.find((m) => m.day === selectedDay) || messMenu[0];

  // Helper to determine active meal
  const getCurrentMealType = () => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 10) return 'breakfast';
    if (hours >= 11 && hours < 15) return 'lunch';
    if (hours >= 15 && hours < 18) return 'snacks';
    if (hours >= 19 && hours < 22) return 'dinner';
    return null;
  };
  const activeMealType = getCurrentMealType();

  const openEdit = (mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner', meal: MessMeal) => {
    setEditingMeal({
      mealType,
      name: meal.name,
      items: [...meal.items],
    });
    setItemInput('');
  };

  const handleSaveMeal = () => {
    if (!editingMeal) return;
    onUpdateMessMeal(selectedDay, editingMeal.mealType, editingMeal.items);
    triggerHaptic('success');
    setEditingMeal(null);
  };

  const addItemToEdit = () => {
    if (!itemInput.trim() || !editingMeal) return;
    setEditingMeal({
      ...editingMeal,
      items: [...editingMeal.items, itemInput.trim()],
    });
    setItemInput('');
  };

  const removeItemFromEdit = (index: number) => {
    if (!editingMeal) return;
    setEditingMeal({
      ...editingMeal,
      items: editingMeal.items.filter((_, i) => i !== index),
    });
  };

  const mealsList: Array<{
    type: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
    meal: MessMeal;
    icon: any;
    color: string;
  }> = [
    {
      type: 'breakfast',
      meal: activeDayMenu.breakfast,
      icon: Sun,
      color: 'from-amber-500/15 to-orange-500/10 border-amber-500/30 text-amber-300',
    },
    {
      type: 'lunch',
      meal: activeDayMenu.lunch,
      icon: Utensils,
      color: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/30 text-emerald-300',
    },
    {
      type: 'snacks',
      meal: activeDayMenu.snacks,
      icon: Coffee,
      color: 'from-purple-500/15 to-indigo-500/10 border-purple-500/30 text-purple-300',
    },
    {
      type: 'dinner',
      meal: activeDayMenu.dinner,
      icon: Moon,
      color: 'from-blue-500/15 to-cyan-500/10 border-blue-500/30 text-blue-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Day Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Utensils className="text-amber-400" size={20} />
            MESS MENU GURUVAYUR CATERING (OCT 26)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Official SCMS Hostel Mess Menu • Breakfast, Lunch, Tea, Dinner
          </p>
        </div>

        {/* Day Pills */}
        <div className="flex items-center bg-[#070914] p-1 rounded-2xl border border-white/[0.08] overflow-x-auto">
          {DAYS.map((day) => {
            const isToday = currentDayName === day;
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedDay(day);
                }}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{day.substring(0, 3)}</span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mealsList.map(({ type, meal, icon: Icon, color }) => {
          const isOngoing = currentDayName === selectedDay && activeMealType === type;

          return (
            <GlassCard
              key={type}
              className={`p-5 relative overflow-hidden transition-all duration-200 ${
                isOngoing
                  ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-[#0d1220] to-[#070a14] shadow-[0_0_24px_rgba(245,158,11,0.15)]'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br border ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{meal.name}</h4>
                      {isOngoing && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          Mess Open Now
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} className="text-slate-500" />
                      {meal.time}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openEdit(type, meal)}
                  className="p-1.5 hover:text-white text-slate-500 rounded-xl hover:bg-white/[0.06] transition-colors"
                  title="Edit meal items"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              {/* Items List */}
              <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                {meal.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs sm:text-sm text-slate-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                    <span>{item}</span>
                  </div>
                ))}

                {meal.notes && (
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-white/[0.04]">
                    {meal.notes}
                  </p>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Edit Meal Modal */}
      <AnimatePresence>
        {editingMeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#070914] border border-white/[0.1] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  Edit {selectedDay} {editingMeal.name}
                </h3>
                <button
                  onClick={() => setEditingMeal(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300">Meal Items</label>

                {/* Items chips */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {editingMeal.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white"
                    >
                      <span>{item}</span>
                      <button
                        onClick={() => removeItemFromEdit(idx)}
                        className="text-slate-400 hover:text-red-400 text-sm ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add item input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={itemInput}
                    onChange={(e) => setItemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItemToEdit();
                      }
                    }}
                    placeholder="e.g. Masala Dosa, Sambar, Chutney"
                    className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={addItemToEdit}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  onClick={() => setEditingMeal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMeal}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-md shadow-amber-500/30 hover:opacity-90 flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Save Menu</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
