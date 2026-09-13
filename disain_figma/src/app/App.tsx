import { useState } from "react";
import { Search, ShoppingCart, Phone, MapPin, Truck, Shield, Wrench, ChevronRight, Star, Menu, X, Package, Clock, Award } from "lucide-react";

const categories = [
  { name: "Toyota / Lexus", count: 4820, icon: "🇯🇵" },
  { name: "Nissan / Infiniti", count: 3610, icon: "🇯🇵" },
  { name: "Honda / Acura", count: 2990, icon: "🇯🇵" },
  { name: "Mitsubishi", count: 2140, icon: "🇯🇵" },
  { name: "Hyundai / Kia", count: 3350, icon: "🇰🇷" },
  { name: "Mazda / Subaru", count: 1870, icon: "🇯🇵" },
];

const products = [
  { id: 1, name: "Тормозные колодки Toyota Camry XV70", art: "04465-33470", price: 3200, oldPrice: 4100, brand: "Toyota OEM", rating: 4.8, reviews: 143, inStock: true, badge: "Оригинал" },
  { id: 2, name: "Фильтр масляный Nissan Qashqai J11", art: "15208-65F0E", price: 890, oldPrice: null, brand: "MANN-Filter", rating: 4.9, reviews: 87, inStock: true, badge: "Хит" },
  { id: 3, name: "Амортизатор передний Honda CR-V RW", art: "51620-TLA-A01", price: 7800, oldPrice: 9200, brand: "KYB", rating: 4.7, reviews: 62, inStock: true, badge: "Скидка" },
  { id: 4, name: "Ремень ГРМ Hyundai Tucson TL 2.0", art: "24312-2E010", price: 2100, oldPrice: null, brand: "Gates", rating: 4.6, reviews: 201, inStock: false, badge: null },
  { id: 5, name: "Свечи зажигания Mazda CX-5 KF 2.5", art: "PE5R-18-110", price: 1450, oldPrice: 1800, brand: "NGK", rating: 4.9, reviews: 318, inStock: true, badge: "Оригинал" },
  { id: 6, name: "Радиатор охлаждения Subaru Forester SJ", art: "45119-FG000", price: 12500, oldPrice: 14000, brand: "Denso", rating: 4.8, reviews: 44, inStock: true, badge: null },
];

const trustItems = [
  { icon: Truck, title: "Доставка по всей России", text: "Отправляем из Владивостока за 3–14 дней" },
  { icon: Shield, title: "Гарантия подлинности", text: "Только оригиналы и сертифицированные аналоги" },
  { icon: Wrench, title: "Подбор по VIN", text: "Бесплатная консультация мастера" },
  { icon: Clock, title: "Работаем с 1998 года", text: "26 лет на рынке Дальнего Востока" },
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  const addToCart = () => setCartCount((c) => c + 1);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Top bar */}
      <div className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 opacity-70">
              <MapPin size={11} className="text-accent" />
              Владивосток, ул. Фадеева, 47
            </span>
            <span className="flex items-center gap-1.5 opacity-70">
              <Clock size={11} />
              Пн–Сб 9:00–19:00
            </span>
          </div>
          <a href="tel:+74232000000" className="flex items-center gap-1.5 font-medium hover:opacity-70 transition-opacity">
            <Phone size={11} />
            +7 (423) 200-00-00
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex-shrink-0" style={{ fontFamily: "'Oswald', sans-serif" }}>
              <div className="text-xl font-bold tracking-widest uppercase text-foreground leading-none">
                ВЛАДИДЕТАЛЬ
              </div>
              <div className="text-[9px] tracking-[0.3em] text-muted-foreground uppercase mt-0.5">
                Владивосток · с 1998
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по артикулу, марке, модели..."
                className="w-full bg-secondary border border-border rounded-full py-2.5 pl-5 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-accent text-white rounded-full hover:bg-red-700 transition-colors flex items-center">
                <Search size={15} />
              </button>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-5">
              <button className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors">
                <Package size={19} />
                <span className="text-[10px] uppercase tracking-wide">Заказы</span>
              </button>
              <button onClick={addToCart} className="relative flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors">
                <ShoppingCart size={19} />
                <span className="text-[10px] uppercase tracking-wide">Корзина</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            <button className="md:hidden text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1 mt-3 border-t border-border pt-3">
            {["Все запчасти", "Японские авто", "Корейские авто", "Двигатель", "Подвеска", "Кузов", "Электрика", "Расходники"].map((item) => (
              <a
                key={item}
                href="#"
                className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all uppercase tracking-wide whitespace-nowrap"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-secondary border-t border-border p-4 flex flex-col gap-3">
            {["Все запчасти", "Японские авто", "Корейские авто", "Двигатель", "Подвеска", "Кузов"].map((item) => (
              <a key={item} href="#" className="text-sm text-muted-foreground hover:text-foreground py-1">{item}</a>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-card">
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center hidden lg:block"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&h=600&fit=crop&auto=format')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/40 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-lg">
            <div
              className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              Дальний Восток · Оригинальные запчасти
            </div>
            <h1
              className="text-5xl lg:text-6xl font-bold uppercase leading-none tracking-tight mb-5 text-foreground"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              Запчасти из
              <br />
              <span className="text-accent">Владивостока</span>
              <br />
              по всей России
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              Более 85 000 позиций японских и корейских автозапчастей. Прямые поставки от дилеров. Работаем с 1998 года.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                className="bg-accent text-white px-7 py-3 rounded-full uppercase tracking-widest text-sm font-semibold hover:bg-red-700 transition-all hover:shadow-lg hover:shadow-accent/20 flex items-center gap-2"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Подобрать по VIN <ChevronRight size={15} />
              </button>
              <button
                className="border border-border bg-secondary px-7 py-3 rounded-full uppercase tracking-widest text-sm font-semibold hover:border-foreground transition-all"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Каталог запчастей
              </button>
            </div>
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-border">
              {[["85 000+", "позиций"], ["26", "лет работы"], ["98%", "довольных"]].map(([n, l]) => (
                <div key={l}>
                  <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>{n}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border bg-secondary">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-9 h-9 flex-shrink-0 bg-accent/10 flex items-center justify-center rounded-full">
                <Icon size={16} className="text-accent" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  {title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-3xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Марки автомобилей
          </h2>
          <a href="#" className="text-accent text-sm flex items-center gap-1 hover:gap-2 transition-all">
            Все марки <ChevronRight size={14} />
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href="#"
              className="group bg-card border border-border rounded-2xl p-4 hover:border-accent hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <div className="text-sm font-semibold text-foreground leading-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>
                {cat.name}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {cat.count.toLocaleString()} позиций
              </div>
              <div className="mt-3 flex items-center gap-1 text-accent text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Перейти</span><ChevronRight size={11} />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="bg-secondary border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-3xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Популярные запчасти
            </h2>
            <a href="#" className="text-accent text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Весь каталог <ChevronRight size={14} />
            </a>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {[["all","Все"], ["engine","Двигатель"], ["suspension","Подвеска"], ["body","Кузов"], ["electrics","Электрика"]].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-accent text-white shadow-md shadow-accent/20"
                    : "bg-card border border-border text-muted-foreground hover:border-accent hover:text-foreground"
                }`}
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all duration-200 flex flex-col"
              >
                {/* Image area */}
                <div className="relative h-44 bg-secondary flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&h=280&fit=crop&auto=format"
                    alt={p.name}
                    className="w-full h-full object-cover opacity-10"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wrench size={44} className="text-border" />
                  </div>
                  {p.badge && (
                    <div className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold ${
                      p.badge === "Оригинал" ? "bg-accent text-white" :
                      p.badge === "Хит" ? "bg-amber-400 text-amber-900" :
                      "bg-emerald-500 text-white"
                    }`}>
                      {p.badge}
                    </div>
                  )}
                  {!p.inStock && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-t-2xl">
                      <span className="text-xs text-muted-foreground uppercase tracking-widest border border-border bg-card px-3 py-1 rounded-full">
                        Под заказ
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div
                    className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {p.art}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug mb-1.5 flex-1">{p.name}</h3>
                  <div className="text-xs text-muted-foreground mb-3">{p.brand}</div>

                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={11} className={s <= Math.round(p.rating) ? "text-amber-400 fill-amber-400" : "text-border"} />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{p.rating} ({p.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                        {p.price.toLocaleString()} ₽
                      </div>
                      {p.oldPrice && (
                        <div className="text-xs text-muted-foreground line-through">{p.oldPrice.toLocaleString()} ₽</div>
                      )}
                    </div>
                    <button
                      onClick={addToCart}
                      disabled={!p.inStock}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs uppercase tracking-widest font-semibold transition-all ${
                        p.inStock
                          ? "bg-accent text-white hover:bg-red-700 hover:shadow-md hover:shadow-accent/20"
                          : "bg-secondary text-muted-foreground cursor-not-allowed"
                      }`}
                      style={{ fontFamily: "'Oswald', sans-serif" }}
                    >
                      <ShoppingCart size={12} />
                      {p.inStock ? "В корзину" : "Заказать"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIN banner */}
      <section className="bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 flex-shrink-0 bg-accent/10 rounded-2xl flex items-center justify-center">
              <Search size={24} className="text-accent" />
            </div>
            <div>
              <div
                className="text-xs uppercase tracking-[0.35em] text-accent mb-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Бесплатный сервис
              </div>
              <h2 className="text-3xl font-bold uppercase text-foreground" style={{ fontFamily: "'Oswald', sans-serif" }}>
                Подбор запчастей по VIN-номеру
              </h2>
              <p className="text-muted-foreground mt-2 text-sm max-w-md leading-relaxed">
                Введите VIN — наш специалист подберёт все необходимые запчасти точно под ваш автомобиль. Без ошибок, бесплатно.
              </p>
            </div>
          </div>
          <div className="w-full lg:w-auto flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="VIN (17 символов)"
                className="flex-1 lg:w-64 bg-secondary border border-border rounded-full px-5 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 uppercase tracking-widest transition-all"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
              <button
                className="bg-accent text-white px-6 py-3 rounded-full uppercase tracking-widest text-sm font-bold hover:bg-red-700 transition-all hover:shadow-lg hover:shadow-accent/20 whitespace-nowrap"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Подобрать
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 pl-1">Ответим в течение 30 минут в рабочее время</p>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold uppercase tracking-tight text-center mb-8" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Бренды в наличии
        </h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {["Toyota", "Nissan", "Honda", "Mitsubishi", "Mazda", "Subaru", "Hyundai", "Kia"].map((brand) => (
            <div
              key={brand}
              className="bg-card border border-border rounded-xl py-4 px-2 flex items-center justify-center hover:border-accent hover:shadow-sm transition-all cursor-pointer group"
            >
              <span
                className="text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors text-center"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                {brand}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-secondary border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Отзывы покупателей
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => <Star key={s} size={13} className="text-amber-400 fill-amber-400" />)}
              </div>
              <span className="text-sm text-muted-foreground">4.87 · 1 204 отзыва</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Андрей К.", city: "Новосибирск", text: "Заказал тормозные колодки для Camry — пришли за 9 дней. Оригинал, всё совпало. Очень доволен!", car: "Toyota Camry 2019" },
              { name: "Ирина М.", city: "Москва", text: "Менеджеры помогли подобрать амортизаторы по VIN. Доставка быстрая, упаковка надёжная. Буду заказывать ещё.", car: "Honda CR-V 2020" },
              { name: "Сергей Л.", city: "Екатеринбург", text: "Хорошая цена, быстрая обратная связь. Запчасти оказались именно те, что нужны. Рекомендую!", car: "Nissan X-Trail 2018" },
            ].map((r) => (
              <div key={r.name} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">"{r.text}"</p>
                <div className="border-t border-border pt-3 flex justify-between items-end">
                  <div>
                    <div className="text-sm font-semibold">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.city}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {r.car}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="text-lg font-bold uppercase tracking-widest mb-3" style={{ fontFamily: "'Oswald', sans-serif" }}>
              ВЛАДИДЕТАЛЬ
            </div>
            <p className="text-xs opacity-50 leading-relaxed mb-4">
              Интернет-магазин оригинальных автозапчастей из Владивостока. Прямые поставки от японских и корейских дилеров.
            </p>
            <div className="flex items-center gap-2 text-xs opacity-50">
              <Award size={11} className="text-accent" />
              Член ТПП Владивостока
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest opacity-40 mb-4 font-semibold" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Каталог
            </div>
            <ul className="space-y-2">
              {["Японские запчасти", "Корейские запчасти", "Двигатель и КПП", "Ходовая часть", "Кузовные детали", "Электрика и оптика"].map(i => (
                <li key={i}><a href="#" className="text-xs opacity-50 hover:opacity-100 transition-opacity">{i}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest opacity-40 mb-4 font-semibold" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Покупателям
            </div>
            <ul className="space-y-2">
              {["Как сделать заказ", "Оплата", "Доставка", "Возврат", "Гарантия", "Вопрос-ответ"].map(i => (
                <li key={i}><a href="#" className="text-xs opacity-50 hover:opacity-100 transition-opacity">{i}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest opacity-40 mb-4 font-semibold" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Контакты
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-xs opacity-60">
                <MapPin size={11} className="mt-0.5 flex-shrink-0" />
                г. Владивосток, ул. Фадеева, 47
              </li>
              <li className="flex items-center gap-2 text-xs opacity-60">
                <Phone size={11} />+7 (423) 200-00-00
              </li>
              <li className="flex items-center gap-2 text-xs opacity-60">
                <Clock size={11} />Пн–Сб 9:00–19:00
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-[11px] opacity-40">© 1998–2026 ВЛАДИДЕТАЛЬ. Все права защищены.</span>
            <span className="text-[10px] opacity-30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              ИНН 2508123456 · ОГРН 1022500001234
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
