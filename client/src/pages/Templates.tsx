import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface TemplateFormData {
  name: string;
  category: string;
  defaultAmount: number;
  note?: string;
}

export default function Templates() {
  const { templates, addTemplate, deleteTemplate } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<TemplateFormData>();

  const onSubmit = async (data: TemplateFormData) => {
    if (editingId) {
      // Update logic would go here if needed
      setEditingId(null);
    } else {
      await addTemplate(data);
    }
    reset();
    setIsOpen(false);
  };

  const handleEdit = (template: any) => {
    setEditingId(template.id);
    setValue('name', template.name);
    setValue('category', template.category);
    setValue('defaultAmount', template.defaultAmount);
    setValue('note', template.note);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(id);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingId(null);
      reset();
    }
    setIsOpen(open);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Templates</h1>
          <p className="text-muted-foreground mt-1">Create reusable transaction templates</p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Template' : 'Create Template'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update your template' : 'Create a reusable transaction template'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Monthly Rent"
                  {...register('name', { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Housing"
                  {...register('category', { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="defaultAmount">Default Amount</Label>
                <Input
                  id="defaultAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('defaultAmount', { valueAsNumber: true, required: true })}
                />
              </div>
              <div>
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  placeholder="Add a note..."
                  {...register('note')}
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? 'Update Template' : 'Create Template'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.category}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template.id!)}
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{template.defaultAmount.toFixed(2)}</div>
              {template.note && <p className="text-sm text-muted-foreground mt-2">{template.note}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No templates yet. Create your first template to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
