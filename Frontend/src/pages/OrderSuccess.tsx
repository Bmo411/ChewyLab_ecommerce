import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Order {
  id?: string; status: string; amount_total?: number; currency?: string;
  items?: { variant_id: string; name: string; weight: string; quantity: number; unit_amount: number }[];
}

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const { user, isLoading, refreshCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState('Estamos esperando la confirmación del pago.');
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) navigate(`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
  }, [isLoading, user, navigate, location.pathname, location.search]);

  useEffect(() => {
    if (!user || !sessionId) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let polls = 0;
    const poll = async () => {
      try {
        const result = await api<Order>(`/api/orders/session/${encodeURIComponent(sessionId)}`, { signal: controller.signal });
        if (controller.signal.aborted) return;
        if (result.id) { setOrder(result); return; }
        if (++polls < 20) timer = setTimeout(poll, 3000);
        else setMessage('La confirmación está tardando. Puedes volver a consultar; conserva esta página.');
      } catch {
        if (!controller.signal.aborted) setMessage('No pudimos consultar el pedido. Puedes volver a intentar en unos momentos.');
      }
    };
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [user, sessionId, attempt]);

  useEffect(() => {
    if (order?.id) {
      if (user) sessionStorage.removeItem(`chewylab:checkout:${user.id}`);
      void refreshCart();
    }
    // El contexto recrea refreshCart; sólo refrescar cuando cambia el pedido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  return <div className="min-h-screen bg-background"><Header />
    <main id="contenido" className="container mx-auto px-6 pt-32 pb-20 max-w-2xl">
      <h1 className="text-3xl font-display mb-6">{order ? '¡Tu pedido está confirmado!' : 'Confirmación de tu pedido'}</h1>
      {!sessionId ? <p>No encontramos una sesión de pago en este enlace.</p> : order ? <>
        <p className="mb-4 break-all">Folio: {order.id}</p>
        <p className="mb-4">Estado: {{ paid: 'Pagado', preparing: 'En preparación', shipped: 'Enviado', delivered: 'Entregado' }[order.status] || order.status}</p>
        <ul className="divide-y divide-border">{order.items?.map(i => <li key={i.variant_id} className="py-4">{i.quantity} × {i.name} · {i.weight}</li>)}</ul>
        <p className="text-xl mt-6">Total: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format((order.amount_total ?? 0) / 100)} MXN</p>
      </> : <><p role="status">{message}</p><Button className="mt-6" onClick={() => { setMessage('Consultando confirmación…'); setAttempt(a => a + 1); }}>Consultar de nuevo</Button></>}
      <Link className="block mt-8 text-gold underline" to="/coleccion">Volver a la colección</Link>
    </main><Footer /></div>;
}
