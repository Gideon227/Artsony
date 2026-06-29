import { Navbar } from '@/components/layout/navbar'
import CartContent from '@/features/cart/components/cart-content'

const CartPage = () => {
  return (
    <div className='bg-white'>
      <Navbar />
      <CartContent />
    </div>
  )
}

export default CartPage