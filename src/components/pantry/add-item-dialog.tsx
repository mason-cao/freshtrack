"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface Category {
  id: number;
  name: string;
  icon: string;
  defaultShelfLifeDays: number;
}

interface AddItemDialogProps {
  onItemAdded: () => void;
}

export function AddItemDialog({ onItemAdded }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("count");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expirationDate, setExpirationDate] = useState("");
  const [costEstimate, setCostEstimate] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    const cat = categories.find((c) => c.id === parseInt(value));
    if (cat && !expirationDate) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + cat.defaultShelfLifeDays);
      setExpirationDate(expiry.toISOString().split("T")[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !expirationDate) return;

    setSaving(true);
    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        categoryId: categoryId ? parseInt(categoryId) : null,
        quantity: parseFloat(quantity) || 1,
        unit,
        purchaseDate,
        expirationDate,
        costEstimate: costEstimate ? parseFloat(costEstimate) : null,
      }),
    });

    // Reset form
    setName("");
    setCategoryId("");
    setQuantity("1");
    setUnit("count");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setExpirationDate("");
    setCostEstimate("");
    setSaving(false);
    setOpen(false);
    onItemAdded();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Pantry Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Greek Yogurt"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["count", "lbs", "oz", "cups", "bag", "box", "container", "carton", "bunch", "loaf", "cans"].map(
                    (u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Est. Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={costEstimate}
                onChange={(e) => setCostEstimate(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date *</Label>
              <Input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Adding..." : "Add to Pantry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
