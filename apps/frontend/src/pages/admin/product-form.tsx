import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import type { Product } from '@vladi-cars/shared-types'
import { useAuth } from '../../lib/auth-context'
import { fetchProduct, createProduct, updateProduct, uploadProductImage } from '../../lib/api'
import { useToast } from '../../lib/toast-context'
import { SEO } from '../../components/seo'
import styles from './product-form.module.css'

const categories = [
  { value: 'engine', label: 'Двигатель' },
  { value: 'transmission', label: 'Трансмиссия' },
  { value: 'suspension', label: 'Подвеска' },
  { value: 'brakes', label: 'Тормозная система' },
  { value: 'body', label: 'Кузовные детали' },
  { value: 'optics', label: 'Оптика' },
  { value: 'electronics', label: 'Электроника' },
  { value: 'interior', label: 'Салон' },
  { value: 'exhaust', label: 'Выхлопная система' },
  { value: 'cooling', label: 'Система охлаждения' },
]

export function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
    modelName: '',
    year: '',
    category: 'engine',
    condition: 'used',
    inStock: true,
    images: '',
  })

  useEffect(() => {
    if (!isEdit || !id) return
    fetchProduct(id)
      .then(p => {
        setForm({
          name: p.name,
          description: p.description,
          price: String(p.price),
          brand: p.brand,
          modelName: p.model,
          year: String(p.year),
          category: p.category,
          condition: p.condition,
          inStock: p.inStock,
          images: (p.images || []).join('\n'),
        })
      })
      .catch(() => addToast('Ошибка загрузки товара', 'error'))
      .finally(() => setLoading(false))
  }, [id, isEdit, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        currency: '₽',
        brand: form.brand,
        modelName: form.modelName,
        year: form.year ? Number(form.year) : 0,
        category: form.category,
        condition: form.condition,
        inStock: form.inStock,
        images: form.images ? form.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
      }
      if (isEdit) {
        await updateProduct(token, id!, data)
        addToast('Товар обновлён', 'success')
      } else {
        const p = await createProduct(token, data)
        addToast('Товар создан', 'success')
        navigate(`/admin/products/${p.id}/edit`)
        return
      }
    } catch {
      addToast('Ошибка при сохранении', 'error')
    } finally {
      setSaving(false)
    }
  }

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id || !token) return
    setUploading(true)
    try {
      const result = await uploadProductImage(token, id, file)
      update('images', result.images.join('\n'))
      addToast('Изображение загружено', 'success')
    } catch {
      addToast('Ошибка загрузки изображения', 'error')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeImage = (url: string) => {
    const current = form.images.split('\n').map(s => s.trim()).filter(Boolean)
    update('images', current.filter(u => u !== url).join('\n'))
  }

  if (user?.role !== 'admin') {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h1 className={styles.emptyTitle}>Доступ запрещён</h1>
          <p className={styles.emptyText}>Только для администраторов</p>
          <Link to="/" className={`btn-accent ${styles.linkReset}`}>На главную</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Загрузка...</h1>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <SEO title={isEdit ? 'Редактировать товар' : 'Новый товар'} description="Администрирование товаров Владидеталь" />
      <h1 className={styles.title}>{isEdit ? 'Редактировать товар' : 'Новый товар'}</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Название *</label>
          <input value={form.name} onChange={e => update('name', e.target.value)} required className={styles.input} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Бренд *</label>
          <input value={form.brand} onChange={e => update('brand', e.target.value)} required className={styles.input} placeholder="Toyota" />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Модель</label>
            <input value={form.modelName} onChange={e => update('modelName', e.target.value)} className={styles.input} placeholder="Camry" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Год</label>
            <input value={form.year} onChange={e => update('year', e.target.value)} type="number" className={styles.input} placeholder="2010" />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Категория *</label>
          <select value={form.category} onChange={e => update('category', e.target.value)} required className={styles.input}>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Цена *</label>
          <input value={form.price} onChange={e => update('price', e.target.value)} type="number" min="0" required className={styles.input} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Описание</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} className={styles.textarea} rows={4} />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Состояние</label>
            <select value={form.condition} onChange={e => update('condition', e.target.value)} className={styles.input}>
              <option value="used">Б/у (контракт)</option>
              <option value="new">Новый</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Наличие</label>
            <label className={styles.checkbox}>
              <input type="checkbox" checked={form.inStock} onChange={e => update('inStock', e.target.checked)} />
              {form.inStock ? 'В наличии' : 'Под заказ'}
            </label>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Изображения</label>
          {form.images && (
            <div className={styles.imageList}>
              {form.images.split('\n').filter(Boolean).map(url => (
                <div key={url} className={styles.imageItem}>
                  <img src={url} alt="" className={styles.imagePreview} />
                  <button type="button" className={styles.imageRemove} onClick={() => removeImage(url)}>×</button>
                </div>
              ))}
            </div>
          )}
          <div className={styles.uploadRow}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className={styles.fileInput} id="image-upload" hidden />
            <label htmlFor="image-upload" className={`btn-accent ${styles.uploadBtn}`}>
              {uploading ? 'Загрузка...' : 'Загрузить изображение'}
            </label>
            {isEdit && <span className={styles.uploadHint}>Файл будет сжат до 800px WebP</span>}
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={saving} className={`btn-accent ${styles.submitBtn}`}>
            {saving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
          </button>
          <Link to="/admin/products" className={styles.cancelBtn}>Отмена</Link>
        </div>
      </form>
    </div>
  )
}
