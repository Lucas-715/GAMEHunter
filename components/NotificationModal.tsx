'use client';
import React from 'react';
import { X, Check, Trash2, Bell, AlertCircle, Gift } from 'lucide-react';
import { Notification } from '../lib/types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDelete: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ 
  isOpen, 
  onClose, 
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onDelete
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end sm:p-4">
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm sm:hidden" onClick={onClose} />
      
      <div className="relative w-full h-full sm:h-auto sm:w-[400px] bg-card sm:border border-border sm:rounded-xl shadow-2xl animate-in slide-in-from-right sm:zoom-in-95 duration-200 flex flex-col max-h-[100vh] sm:max-h-[85vh] mt-16 sm:mt-14">
        
        <div className="flex items-center justify-between p-4 border-b border-border bg-card z-10 sticky top-0 rounded-t-xl">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell size={20} /> Notificações
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={onMarkAllAsRead} 
              className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary transition-colors" 
              title="Marcar todas como lidas"
              disabled={notifications.length === 0}
            >
              <Check size={18} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Bell size={48} className="mb-4 opacity-20" />
              <p>Nenhuma notificação no momento.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`p-3 rounded-lg flex gap-3 transition-colors hover:bg-secondary/50 group cursor-default ${!notif.read ? 'bg-secondary/30' : ''}`}
                >
                  <div className="mt-0.5">
                    {notif.type === 'alert' && <AlertCircle size={18} className="text-primary" />}
                    {notif.type === 'promo' && <Gift size={18} className="text-warning" />}
                    {notif.type === 'system' && <Bell size={18} className="text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`text-sm font-medium ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    <button onClick={() => onDelete(notif.id)} className="text-muted-foreground hover:text-danger p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border bg-card text-center rounded-b-xl">
          <button 
            onClick={onClearAll} 
            className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            disabled={notifications.length === 0}
          >
            Limpar todas as notificações
          </button>
        </div>

      </div>
    </div>
  );
};
