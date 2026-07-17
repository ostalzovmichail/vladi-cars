import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { CartProvider } from './lib/cart-context'
import { CompareProvider } from './lib/compare-context'
import { AuthProvider } from './lib/auth-context'
import { ToastProvider } from './lib/toast-context'
import { ErrorBoundary } from './components/error-boundary'
import { Header } from './components/header'
import { Footer } from './components/footer'
import appStyles from './app.module.css'

const HomePage = lazy(() => import('./pages/home').then(m => ({ default: m.HomePage })))
const CatalogPage = lazy(() => import('./pages/catalog').then(m => ({ default: m.CatalogPage })))
const ProductPage = lazy(() => import('./pages/product').then(m => ({ default: m.ProductPage })))
const CartPage = lazy(() => import('./pages/cart').then(m => ({ default: m.CartPage })))
const FavoritesPage = lazy(() => import('./pages/favorites').then(m => ({ default: m.FavoritesPage })))
const OrdersListPage = lazy(() => import('./pages/orders-list').then(m => ({ default: m.OrdersListPage })))
const OrderDetailPage = lazy(() => import('./pages/order-detail').then(m => ({ default: m.OrderDetailPage })))
const AboutPage = lazy(() => import('./pages/about').then(m => ({ default: m.AboutPage })))
const LoginPage = lazy(() => import('./pages/auth/login').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/auth/register').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./pages/auth/forgot-password').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/auth/reset-password').then(m => ({ default: m.ResetPasswordPage })))
const NotFoundPage = lazy(() => import('./pages/not-found').then(m => ({ default: m.NotFoundPage })))
const AdminOrdersPage = lazy(() => import('./pages/admin/orders').then(m => ({ default: m.AdminOrdersPage })))
const AdminProductsPage = lazy(() => import('./pages/admin/products').then(m => ({ default: m.AdminProductsPage })))
const AdminProductFormPage = lazy(() => import('./pages/admin/product-form').then(m => ({ default: m.AdminProductFormPage })))
const ComparePage = lazy(() => import('./pages/compare').then(m => ({ default: m.ComparePage })))
const ProfilePage = lazy(() => import('./pages/profile').then(m => ({ default: m.ProfilePage })))
import { CompareBar } from './components/compare-bar'

function PageLoader() {
  return (
    <div className={appStyles.loader}>
      <div className={appStyles.loaderSpinner} />
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <CompareProvider>
              <ErrorBoundary>
                <div className={`min-h-screen flex flex-col ${appStyles.bg}`}>
                  <Header />
                  {isHome ? (
                    <main className="flex-1">
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                        </Routes>
                      </Suspense>
                    </main>
                  ) : (
                    <main className={`flex-1 ${appStyles.main}`}>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/catalog" element={<ErrorBoundary><CatalogPage /></ErrorBoundary>} />
                          <Route path="/product/:id" element={<ErrorBoundary><ProductPage /></ErrorBoundary>} />
                          <Route path="/cart" element={<ErrorBoundary><CartPage /></ErrorBoundary>} />
                          <Route path="/orders" element={<ErrorBoundary><OrdersListPage /></ErrorBoundary>} />
                          <Route path="/orders/:id" element={<ErrorBoundary><OrderDetailPage /></ErrorBoundary>} />
                          <Route path="/favorites" element={<ErrorBoundary><FavoritesPage /></ErrorBoundary>} />
                          <Route path="/profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
                          <Route path="/about" element={<ErrorBoundary><AboutPage /></ErrorBoundary>} />
                          <Route path="/compare" element={<ErrorBoundary><ComparePage /></ErrorBoundary>} />
                          <Route path="/admin/orders" element={<ErrorBoundary><AdminOrdersPage /></ErrorBoundary>} />
                          <Route path="/admin/products" element={<ErrorBoundary><AdminProductsPage /></ErrorBoundary>} />
                          <Route path="/admin/products/new" element={<ErrorBoundary><AdminProductFormPage /></ErrorBoundary>} />
                          <Route path="/admin/products/:id/edit" element={<ErrorBoundary><AdminProductFormPage /></ErrorBoundary>} />
                          <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
                          <Route path="/register" element={<ErrorBoundary><RegisterPage /></ErrorBoundary>} />
                          <Route path="/forgot-password" element={<ErrorBoundary><ForgotPasswordPage /></ErrorBoundary>} />
                          <Route path="/reset-password" element={<ErrorBoundary><ResetPasswordPage /></ErrorBoundary>} />
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </Suspense>
                    </main>
                  )}
                  <CompareBar />
                  <Footer />
                </div>
              </ErrorBoundary>
            </CompareProvider>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
