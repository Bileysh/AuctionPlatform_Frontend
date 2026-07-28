import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateAuction } from '@/hooks/useCreateAuction'; // Шлях до твого хука
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const createAuctionSchema = z.object({
  title: z.string().min(3, 'Назва має містити мінімум 3 символи'),
  description: z.string().min(5, 'Додайте детальніший опис'),
  startingPrice: z.number().min(1, 'Стартова ціна має бути більшою за нуль'),
  categoryId: z.number().min(1, 'Оберіть категорію'), // Додали валідацію категорії
  endTime: z.string().min(1, 'Оберіть дату завершення').refine((val) => {
    const selectedDate = new Date(val);
    return !isNaN(selectedDate.getTime()) && selectedDate > new Date();
  }, {
    message: 'Дата завершення має бути в майбутньому',
  }),
});

type CreateAuctionFormValues = z.infer<typeof createAuctionSchema>;

export default function CreateAuctionPage() {
  const { mutate: createAuction, isPending } = useCreateAuction();

 const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAuctionFormValues>({
    resolver: zodResolver(createAuctionSchema),
    defaultValues: {
      title: '',
      description: '',
      startingPrice: 0,
      categoryId: 1, 
      endTime: '',
    },
  });

 const onSubmit = (data: CreateAuctionFormValues) => {
    createAuction({
      title: data.title,
      description: data.description,
      startingPrice: data.startingPrice,
      categoryId: data.categoryId, 
      endsAt: new Date(data.endTime).toISOString(), 
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm mt-10">
      <h1 className="text-2xl font-bold mb-6">Створити новий аукціон</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div>
          <label className="block text-sm font-medium mb-2">Назва лота</label>
          <Input 
            {...register('title')} 
            placeholder="Наприклад: Рідкісна монета 1920 року" 
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Опис</label>
          <Textarea 
            {...register('description')} 
            placeholder="Опишіть стан, історію та характеристики..." 
            rows={5}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Стартова ціна (₴)</label>
          <Input 
            type="number" 
            {...register('startingPrice', { valueAsNumber: true })} 
            className={errors.startingPrice ? 'border-red-500' : ''}
          />
          {errors.startingPrice && <p className="text-red-500 text-sm mt-1">{errors.startingPrice.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Дата та час завершення</label>
          <Input 
            type="datetime-local" 
            {...register('endTime')} 
            className={errors.endTime ? 'border-red-500' : ''}
          />
          {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Категорія</label>
          <select 
            {...register('categoryId', { valueAsNumber: true })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value={1}>Електроніка</option>
            <option value={2}>Автомобілі</option>
            <option value={3}>Мистецтво</option>
          </select>
          {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Створення...' : 'Створити аукціон'}
        </Button>
      </form>
    </div>
  );
}