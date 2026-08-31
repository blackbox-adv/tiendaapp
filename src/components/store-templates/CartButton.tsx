'use client'

import { useState, useCallback } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, MessageCircle, Loader2, X } from 'lucide-react'
import { useCart, type CartItem } from '@/lib/cart-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface CartButtonProps {
  storeId: string
  whatsappNumber?: string
  storeName?: string
}

export function CartButton({ storeId, whatsappNumber, storeName }: CartButtonProps) {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalAmount, totalItems } = useCart()
  const [open, setOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart')
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; orderNumber?: string } | null>(null)

  // Filter cart items for this store only
  const storeCartItems = cartItems.filter((item) => item.storeId === storeId)
  const storeTotal = storeCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const storeItemCount = storeCartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Form state for checkout
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')

  const handleWhatsApp = useCallback(() => {
    if (!whatsappNumber || storeCartItems.length === 0) return

    const itemsText = storeCartItems
      .map((item) => `- ${item.name} x${item.quantity} (S/ ${(item.price * item.quantity).toFixed(2)})`)
      .join('\n')

    const message = [
      `Hola, quiero hacer un pedido de ${storeName || 'su tienda'}:`,
      '',
      itemsText,
      '',
      `Total: S/ ${storeTotal.toFixed(2)}`,
      customerName ? `\nNombre: ${customerName}` : '',
      customerPhone ? `Teléfono: ${customerPhone}` : '',
      notes ? `\nNotas: ${notes}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }, [whatsappNumber, storeCartItems, storeName, storeTotal, customerName, customerPhone, notes])

  const handleConfirmOrder = useCallback(async () => {
    if (!customerName.trim() || !customerPhone.trim()) return
    if (storeCartItems.length === 0) return

    setSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          items: storeCartItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          })),
          notes: notes.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitResult({
          success: true,
          message: '¡Pedido creado exitosamente!',
          orderNumber: data.orderNumber,
        })
        // Clear only this store's items from cart
        storeCartItems.forEach((item) => removeFromCart(item.productId))
        setCheckoutStep('cart')
        setCustomerName('')
        setCustomerPhone('')
        setCustomerEmail('')
        setNotes('')
      } else {
        setSubmitResult({
          success: false,
          message: data.error || 'Error al crear el pedido',
        })
      }
    } catch {
      setSubmitResult({
        success: false,
        message: 'Error de conexión. Intenta nuevamente.',
      })
    } finally {
      setSubmitting(false)
    }
  }, [storeId, customerName, customerPhone, customerEmail, notes, storeCartItems, removeFromCart])

  // Don't render if no items for this store
  if (storeItemCount === 0 && !open) return null

  return (
    <>
      {/* Floating cart button */}
      <button
        onClick={() => {
          setOpen(true)
          setCheckoutStep('cart')
          setSubmitResult(null)
        }}
        className="fab-above-cookie fixed bottom-6 left-6 z-50 w-14 h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
        aria-label={`Carrito de compras (${storeItemCount} items)`}
      >
        <ShoppingCart className="w-6 h-6" />
        {storeItemCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center px-1 border-0">
            {storeItemCount}
          </Badge>
        )}
      </button>

      {/* Cart sheet / drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {checkoutStep === 'cart' ? 'Mi Carrito' : 'Confirmar Pedido'}
            </SheetTitle>
          </SheetHeader>

          {/* Success message */}
          {submitResult?.success && (
            <div className="mx-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              <p className="font-semibold">{submitResult.message}</p>
              {submitResult.orderNumber && (
                <p className="text-xs mt-1">Pedido: {submitResult.orderNumber}</p>
              )}
            </div>
          )}

          {/* Error message */}
          {submitResult && !submitResult.success && (
            <div className="mx-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {submitResult.message}
            </div>
          )}

          {checkoutStep === 'cart' ? (
            <>
              {/* Cart items list */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                {storeCartItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Tu carrito está vacío</p>
                    <p className="text-sm mt-1">Agrega productos para comenzar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {storeCartItems.map((item) => (
                      <CartItemRow
                        key={item.productId}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer with total and actions */}
              {storeCartItems.length > 0 && (
                <SheetFooter className="p-4 pt-2 border-t bg-gray-50/50">
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>S/ {storeTotal.toFixed(2)}</span>
                    </div>

                    <Button
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                      onClick={() => {
                        setCheckoutStep('checkout')
                        setSubmitResult(null)
                      }}
                    >
                      Hacer pedido
                    </Button>

                    {whatsappNumber && (
                      <Button
                        variant="outline"
                        className="w-full border-green-500 text-green-700 hover:bg-green-50"
                        onClick={handleWhatsApp}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Pedir por WhatsApp
                      </Button>
                    )}

                    <button
                      onClick={clearCart}
                      className="w-full text-center text-sm text-gray-400 hover:text-red-500 transition-colors py-1"
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </SheetFooter>
              )}
            </>
          ) : (
            <>
              {/* Checkout form */}
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
                {/* Order summary */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-600 mb-2">Resumen del pedido</p>
                  {storeCartItems.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium">S/ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>S/ {storeTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Customer info */}
                <div className="space-y-3">
                  <div>
                    <label htmlFor="cart-customer-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo *
                    </label>
                    <Input
                      id="cart-customer-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cart-customer-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono / Celular *
                    </label>
                    <Input
                      id="cart-customer-phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="999 888 777"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cart-customer-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email (opcional)
                    </label>
                    <Input
                      id="cart-customer-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="cart-customer-notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notas del pedido (opcional)
                    </label>
                    <Input
                      id="cart-customer-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ej: Sin cebolla, entregar después de las 5pm..."
                    />
                  </div>
                </div>
              </div>

              {/* Checkout footer */}
              <SheetFooter className="p-4 pt-2 border-t bg-gray-50/50">
                <div className="w-full space-y-3">
                  <Button
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                    onClick={handleConfirmOrder}
                    disabled={submitting || !customerName.trim() || !customerPhone.trim()}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      `Confirmar pedido — S/ ${storeTotal.toFixed(2)}`
                    )}
                  </Button>

                  {whatsappNumber && (
                    <Button
                      variant="outline"
                      className="w-full border-green-500 text-green-700 hover:bg-green-50"
                      onClick={handleWhatsApp}
                      disabled={submitting}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Pedir por WhatsApp
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setCheckoutStep('cart')}
                    disabled={submitting}
                  >
                    ← Volver al carrito
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

// ── Cart item row component ──
function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
      {/* Product image */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
          <ShoppingCart className="w-5 h-5 text-gray-400" />
        </div>
      )}

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-gray-500">S/ {item.price.toFixed(2)} c/u</p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
          className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          aria-label="Disminuir cantidad"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
          className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
          aria-label="Aumentar cantidad"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Item total & remove */}
      <div className="flex flex-col items-end flex-shrink-0">
        <p className="text-sm font-semibold text-gray-900">
          S/ {(item.price * item.quantity).toFixed(2)}
        </p>
        <button
          onClick={() => onRemove(item.productId)}
          className="text-gray-400 hover:text-red-500 transition-colors mt-0.5"
          aria-label="Eliminar del carrito"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
