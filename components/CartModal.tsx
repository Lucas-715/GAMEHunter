'use client';
import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Trash2, Tag, CheckCircle2, Copy, Check, CreditCard, QrCode, Key, ExternalLink, ShieldCheck, Sparkles, ArrowRight, PackageCheck } from 'lucide-react';
import { GameItem } from '../lib/types';
import { useSession } from 'next-auth/react';

export interface CartItem {
  gameId: string;
  name: string;
  price: number;
  storeName: string;
  coverImageUrl: string;
  platform: string;
}

export interface PurchasedOrder {
  orderId: string;
  date: string;
  items: Array<{
    gameId: string;
    name: string;
    price: number;
    platform: string;
    coverImageUrl: string;
    activationKey: string;
  }>;
  totalPaid: number;
  paymentMethod: 'PIX' | 'CARD';
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onRemoveFromCart: (gameId: string) => void;
  onClearCart: () => void;
  initialTab?: 'cart' | 'checkout' | 'library';
}

const VALID_COUPONS: Record<string, number> = {
  'HUNTER10': 10,
  'HUNTER20': 20,
  'HUNTER25': 25,
  'PRIMEIRACOMPRA': 15,
  'GAMER': 10,
};

function generateActivationKey(seedStr: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let block = 0; block < 4; block++) {
    if (block > 0) result += '-';
    for (let i = 0; i < 4; i++) {
      const idx = Math.floor(Math.random() * chars.length);
      result += chars[idx];
    }
  }
  return result;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onRemoveFromCart,
  onClearCart,
  initialTab = 'cart',
}) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'cart' | 'checkout' | 'library'>(initialTab);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Checkout state
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD'>('PIX');
  const [guestEmail, setGuestEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);

  // Orders / Library state
  const [orders, setOrders] = useState<PurchasedOrder[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      const savedOrders = localStorage.getItem('gamehunter_orders');
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders));
        } catch {
          setOrders([]);
        }
      }
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const couponDiscount = appliedCoupon ? subtotal * (appliedCoupon.percent / 100) : 0;
  const pixDiscount = paymentMethod === 'PIX' && activeTab === 'checkout' ? (subtotal - couponDiscount) * 0.05 : 0;
  const finalTotal = Math.max(0, subtotal - couponDiscount - pixDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (VALID_COUPONS[code]) {
      setAppliedCoupon({ code, percent: VALID_COUPONS[code] });
      setCouponInput('');
    } else {
      setCouponError('Cupom inválido. Tente HUNTER10 ou PRIMEIRACOMPRA.');
    }
  };

  const handleCompletePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setProcessing(true);
    setTimeout(() => {
      const newOrder: PurchasedOrder = {
        orderId: 'GH-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: cart.map(item => ({
          gameId: item.gameId,
          name: item.name,
          price: item.price,
          platform: item.platform || 'Steam Key Oficial',
          coverImageUrl: item.coverImageUrl,
          activationKey: generateActivationKey(item.name),
        })),
        totalPaid: finalTotal,
        paymentMethod,
      };

      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('gamehunter_orders', JSON.stringify(updatedOrders));
      
      // Revela automaticamente as chaves recém-compradas
      const autoReveal: Record<string, boolean> = { ...revealedKeys };
      newOrder.items.forEach(i => {
        autoReveal[i.activationKey] = true;
      });
      setRevealedKeys(autoReveal);

      onClearCart();
      setAppliedCoupon(null);
      setProcessing(false);
      setActiveTab('library');
    }, 1000);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText('00020126580014BR.GOV.BCB.PIX0136gamehunter-pagamentos-oficial-pix5204000053039865802BR');
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  const totalKeysCount = orders.reduce((acc, o) => acc + o.items.length, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header com Navegação */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              {activeTab === 'library' ? <Key size={20} /> : <ShoppingCart size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {activeTab === 'cart' && 'Carrinho de Compras'}
                {activeTab === 'checkout' && 'Checkout & Ativação Digital'}
                {activeTab === 'library' && 'Minhas Keys & Biblioteca'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {session?.user ? `Logado como ${session.user.name || session.user.email}` : ' Compra rápida disponível sem necessidade de login'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-secondary/60 p-1 rounded-xl border border-border mr-2">
              <button
                onClick={() => setActiveTab('cart')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === 'cart' || activeTab === 'checkout' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Carrinho ({cart.length})
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === 'library' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Minhas Keys ({totalKeysCount})
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* ABA 1: CARRINHO */}
          {activeTab === 'cart' && (
            <div className="space-y-6 animate-in fade-in">
              {cart.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center text-muted-foreground mb-1">
                    <ShoppingCart size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Seu carrinho está vazio</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Adicione jogos pelo painel de ofertas ou comparador para adquirir chaves digitais de ativação imediata.
                  </p>
                  {totalKeysCount > 0 && (
                    <button
                      onClick={() => setActiveTab('library')}
                      className="btn-secondary text-xs px-4 py-2 rounded-xl font-bold mt-2 flex items-center gap-1.5"
                    >
                      <Key size={14} /> Ver Minhas Keys Compradas ({totalKeysCount})
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.gameId} className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img src={item.coverImageUrl || '/placeholder.jpg'} alt={item.name} className="w-16 h-12 rounded-lg object-cover border border-border shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-foreground truncate">{item.name}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                              <span className="text-primary font-semibold flex items-center gap-1">
                                <ShieldCheck size={12} /> {item.platform || 'Chave Steam Oficial'}
                              </span>
                              <span>•</span>
                              <span>Menor cotação via {item.storeName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className="font-black font-mono text-sm text-foreground">
                            R$ {item.price.toFixed(2).replace('.', ',')}
                          </span>
                          <button
                            onClick={() => onRemoveFromCart(item.gameId)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
                            title="Remover do carrinho"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cupom de Desconto */}
                  <div className="p-4 rounded-xl bg-secondary/20 border border-border space-y-2">
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Cupom de desconto (ex: HUNTER10 ou PRIMEIRACOMPRA)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-mono uppercase text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                      <button type="submit" className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold">
                        Aplicar
                      </button>
                    </form>
                    {couponError && <p className="text-[11px] text-danger font-medium">{couponError}</p>}
                    {appliedCoupon && (
                      <div className="flex items-center justify-between text-xs text-success font-bold pt-1">
                        <span className="flex items-center gap-1"><Sparkles size={13} /> Cupom {appliedCoupon.code} ativo (-{appliedCoupon.percent}%)</span>
                        <button onClick={() => setAppliedCoupon(null)} className="text-[11px] text-muted-foreground hover:underline">Remover</button>
                      </div>
                    )}
                  </div>

                  {/* Resumo de Valores */}
                  <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({cart.length} {cart.length === 1 ? 'jogo' : 'jogos'})</span>
                      <span className="font-mono">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-success font-semibold">
                        <span>Desconto Cupom ({appliedCoupon.code})</span>
                        <span className="font-mono">- R$ {couponDiscount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-foreground pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="font-mono text-primary">R$ {(subtotal - couponDiscount).toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClearCart}
                      className="btn-secondary py-3 px-4 rounded-xl text-xs font-bold"
                    >
                      Limpar
                    </button>
                    <button
                      onClick={() => setActiveTab('checkout')}
                      className="flex-1 btn-primary py-3 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                    >
                      Avançar para Pagamento <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ABA 2: CHECKOUT */}
          {activeTab === 'checkout' && (
            <form onSubmit={handleCompletePurchase} className="space-y-5 animate-in fade-in">
              {!session?.user && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    E-mail para recebimento da Chave (Modo Visitante)
                  </label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${paymentMethod === 'PIX' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'}`}
                  >
                    <QrCode size={22} />
                    <div>
                      <div className="text-xs font-bold text-foreground">PIX Instantâneo</div>
                      <div className="text-[10px] text-success font-bold">+5% OFF • Liberação na hora</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${paymentMethod === 'CARD' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary'}`}
                  >
                    <CreditCard size={22} />
                    <div>
                      <div className="text-xs font-bold text-foreground">Cartão de Crédito</div>
                      <div className="text-[10px] text-muted-foreground">Até 3x sem juros</div>
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === 'PIX' ? (
                <div className="p-4 rounded-xl bg-secondary/30 border border-border flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0">
                    {/* Simulação visual de QR Code PIX */}
                    <div className="w-full h-full border-4 border-black grid grid-cols-4 grid-rows-4 gap-0.5 p-1 bg-white">
                      <div className="bg-black col-span-2 row-span-2" />
                      <div className="bg-black" />
                      <div className="bg-black" />
                      <div className="bg-black" />
                      <div className="bg-black col-span-2" />
                      <div className="bg-black row-span-2" />
                      <div className="bg-black col-span-2" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="text-xs font-bold text-foreground">Chave PIX Copia e Cola gerada</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Após copiar o código ou escanear o QR Code, clique em <strong>Confirmar e Liberar Keys</strong> abaixo para receber suas chaves de ativação instantaneamente.
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="btn-secondary py-1.5 px-3 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5"
                    >
                      {pixCopied ? <><Check size={13} className="text-success" /> Código PIX Copiado!</> : <><Copy size={13} /> Copiar Código PIX</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-xl bg-secondary/30 border border-border">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Número do Cartão</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">Validade</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">CVV</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">Parcelas</label>
                      <select className="w-full bg-background border border-border rounded-lg px-2 py-2 text-xs text-foreground focus:outline-none focus:border-primary">
                        <option>1x sem juros</option>
                        <option>2x sem juros</option>
                        <option>3x sem juros</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">Nome Impresso no Cartão</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="NOME COMPLETO"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs uppercase text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {/* Resumo Final do Checkout */}
              <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-success">
                    <span>Cupom ({appliedCoupon.code})</span>
                    <span className="font-mono">- R$ {couponDiscount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                {paymentMethod === 'PIX' && (
                  <div className="flex justify-between text-success">
                    <span>Desconto PIX (5%)</span>
                    <span className="font-mono">- R$ {pixDiscount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-foreground pt-2 border-t border-border">
                  <span>Total a Pagar</span>
                  <span className="font-mono text-primary">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('cart')}
                  className="btn-secondary py-3 px-4 rounded-xl text-xs font-bold"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 btn-primary py-3 px-6 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                >
                  {processing ? 'Gerando Chaves Digitais...' : <><PackageCheck size={17} /> Confirmar e Liberar Keys</>}
                </button>
              </div>
            </form>
          )}

          {/* ABA 3: MINHAS KEYS / BIBLIOTECA */}
          {activeTab === 'library' && (
            <div className="space-y-4 animate-in fade-in">
              {orders.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 bg-secondary/50 rounded-2xl flex items-center justify-center text-muted-foreground mb-1">
                    <Key size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Nenhuma chave adquirida ainda</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Suas chaves de ativação (Steam / GOG / Nuuvem) aparecerão aqui imediatamente após a confirmação do pedido.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                  {orders.map((order) => (
                    <div key={order.orderId} className="p-4 rounded-2xl bg-secondary/25 border border-border space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary">Pedido #{order.orderId}</span>
                          <span className="text-muted-foreground">• {order.date}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-success/15 text-success rounded-full text-[10px] font-bold uppercase">
                          Pago via {order.paymentMethod} (R$ {order.totalPaid.toFixed(2).replace('.', ',')})
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {order.items.map((item, idx) => {
                          const isRevealed = revealedKeys[item.activationKey];
                          const isCopied = copiedKey === item.activationKey;

                          return (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={item.coverImageUrl || '/placeholder.jpg'} alt={item.name} className="w-14 h-10 rounded object-cover border border-border shrink-0" />
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-foreground truncate">{item.name}</h4>
                                  <span className="text-[10px] text-muted-foreground">{item.platform}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="px-3 py-1.5 rounded-lg bg-secondary border border-border font-mono text-xs font-bold tracking-wider text-primary">
                                  {isRevealed ? item.activationKey : '••••-••••-••••-••••'}
                                </div>
                                {!isRevealed ? (
                                  <button
                                    onClick={() => setRevealedKeys(prev => ({ ...prev, [item.activationKey]: true }))}
                                    className="btn-primary py-1.5 px-3 rounded-lg text-[11px] font-bold"
                                  >
                                    Revelar Key
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleCopyKey(item.activationKey)}
                                    className="btn-secondary py-1.5 px-3 rounded-lg text-[11px] font-bold flex items-center gap-1"
                                    title="Copiar Chave"
                                  >
                                    {isCopied ? <><Check size={13} className="text-success" /> Copiada</> : <><Copy size={13} /> Copiar</>}
                                  </button>
                                )}
                                <a
                                  href="https://store.steampowered.com/account/registerkey"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                  title="Ativar chave na Steam"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default CartModal;

