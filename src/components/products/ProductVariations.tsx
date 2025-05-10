import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, X, Edit, Check } from 'lucide-react';
import { toast } from 'sonner';

export interface VariationOption {
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  sku: string;
}

interface ProductVariationsProps {
  options: VariationOption[];
  variants: ProductVariant[];
  onChange: (options: VariationOption[], variants: ProductVariant[]) => void;
}

const ProductVariations: React.FC<ProductVariationsProps> = ({
  options = [],
  variants = [],
  onChange,
}) => {
  const [optionName, setOptionName] = useState('');
  const [optionValues, setOptionValues] = useState('');
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingOptionName, setEditingOptionName] = useState('');
  const [editingOptionValues, setEditingOptionValues] = useState('');

  // Generate variants when options change
  useEffect(() => {
    if (options.length > 0 && (variants.length === 0 || shouldRegenerateVariants())) {
      generateVariants();
    }
  }, [options]);

  // Check if we need to regenerate variants (e.g., when options change)
  const shouldRegenerateVariants = () => {
    // Check if all variants have all the current options
    if (variants.length === 0) return true;
    
    const optionNames = options.map(opt => opt.name);
    return variants.some(variant => {
      const variantOptionNames = Object.keys(variant.attributes);
      return !optionNames.every(name => variantOptionNames.includes(name));
    });
  };

  const addOption = () => {
    if (!optionName.trim()) {
      toast.error('Option name is required');
      return;
    }

    if (!optionValues.trim()) {
      toast.error('At least one option value is required');
      return;
    }

    // Check for duplicate option name
    if (options.some(opt => opt.name.toLowerCase() === optionName.toLowerCase())) {
      toast.error(`Option "${optionName}" already exists`);
      return;
    }

    const values = optionValues.split(',').map(v => v.trim()).filter(v => v);
    
    const newOption: VariationOption = {
      id: Date.now().toString(),
      name: optionName,
      values,
    };

    const newOptions = [...options, newOption];
    onChange(newOptions, variants);
    
    setOptionName('');
    setOptionValues('');
  };

  const removeOption = (id: string) => {
    const newOptions = options.filter(opt => opt.id !== id);
    
    // Remove this option from all variants
    const optionToRemove = options.find(opt => opt.id === id);
    if (optionToRemove) {
      const newVariants = variants.map(variant => {
        const newAttributes = { ...variant.attributes };
        delete newAttributes[optionToRemove.name];
        return { ...variant, attributes: newAttributes };
      });
      
      onChange(newOptions, newVariants);
    } else {
      onChange(newOptions, variants);
    }
  };

  const startEditOption = (option: VariationOption) => {
    setEditingOptionId(option.id);
    setEditingOptionName(option.name);
    setEditingOptionValues(option.values.join(', '));
  };

  const saveEditOption = (id: string) => {
    if (!editingOptionName.trim()) {
      toast.error('Option name is required');
      return;
    }

    if (!editingOptionValues.trim()) {
      toast.error('At least one option value is required');
      return;
    }

    // Check for duplicate option name (excluding the current one)
    if (options.some(opt => opt.id !== id && opt.name.toLowerCase() === editingOptionName.toLowerCase())) {
      toast.error(`Option "${editingOptionName}" already exists`);
      return;
    }

    const values = editingOptionValues.split(',').map(v => v.trim()).filter(v => v);
    
    const newOptions = options.map(opt => {
      if (opt.id === id) {
        // Get the old name to update variant attributes
        const oldName = opt.name;
        const newOption = { ...opt, name: editingOptionName, values };
        
        // Update variant attributes if the option name changed
        if (oldName !== editingOptionName) {
          const newVariants = variants.map(variant => {
            const newAttributes = { ...variant.attributes };
            if (newAttributes[oldName] !== undefined) {
              newAttributes[editingOptionName] = newAttributes[oldName];
              delete newAttributes[oldName];
            }
            return { ...variant, attributes: newAttributes };
          });
          
          onChange(newOptions, newVariants);
        } else {
          // If only values changed, we might need to update variants
          // that use values that no longer exist
          const newVariants = variants.map(variant => {
            const attrValue = variant.attributes[oldName];
            if (attrValue && !values.includes(attrValue)) {
              // This variant has a value that no longer exists
              // Set it to the first available value
              const newAttributes = { ...variant.attributes };
              newAttributes[oldName] = values[0] || '';
              return { ...variant, attributes: newAttributes };
            }
            return variant;
          });
          
          onChange(newOptions, newVariants);
        }
        
        return newOption;
      }
      return opt;
    });
    
    setEditingOptionId(null);
  };

  const cancelEditOption = () => {
    setEditingOptionId(null);
  };

  const generateVariants = () => {
    if (options.length === 0) return;

    // Get all possible combinations of option values
    const generateCombinations = (optionIndex = 0, currentCombination: Record<string, string> = {}) => {
      if (optionIndex >= options.length) {
        return [currentCombination];
      }

      const currentOption = options[optionIndex];
      const combinations: Record<string, string>[] = [];

      currentOption.values.forEach(value => {
        const newCombination = { ...currentCombination, [currentOption.name]: value };
        combinations.push(...generateCombinations(optionIndex + 1, newCombination));
      });

      return combinations;
    };

    const combinations = generateCombinations();

    // Create variants from combinations, preserving existing data where possible
    const newVariants = combinations.map(combination => {
      // Try to find an existing variant with the same attributes
      const existingVariant = variants.find(v => {
        return Object.entries(combination).every(
          ([key, value]) => v.attributes[key] === value
        );
      });

      if (existingVariant) {
        return existingVariant;
      }

      // Create a new variant
      return {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        attributes: combination,
        price: 0,
        stock: 0,
        sku: '',
      };
    });

    onChange(options, newVariants);
  };

  const updateVariant = (id: string, field: 'price' | 'stock' | 'sku', value: string | number) => {
    const newVariants = variants.map(variant => {
      if (variant.id === id) {
        return { ...variant, [field]: value };
      }
      return variant;
    });

    onChange(options, newVariants);
  };

  const getAttributeDisplay = (attributes: Record<string, string>) => {
    return Object.entries(attributes)
      .map(([name, value]) => `${name}: ${value}`)
      .join(' / ');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Product Options</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={generateVariants}
            disabled={options.length === 0}
          >
            Regenerate Variants
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="optionName">Option Name</Label>
            <Input
              id="optionName"
              placeholder="e.g., Size, Color, Material"
              value={optionName}
              onChange={(e) => setOptionName(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="optionValues">Option Values (comma separated)</Label>
            <div className="flex space-x-2">
              <Input
                id="optionValues"
                placeholder="e.g., Small, Medium, Large"
                value={optionValues}
                onChange={(e) => setOptionValues(e.target.value)}
              />
              <Button type="button" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {options.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Option Name</TableHead>
                  <TableHead>Values</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {options.map((option) => (
                  <TableRow key={option.id}>
                    <TableCell>
                      {editingOptionId === option.id ? (
                        <Input
                          value={editingOptionName}
                          onChange={(e) => setEditingOptionName(e.target.value)}
                        />
                      ) : (
                        option.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingOptionId === option.id ? (
                        <Input
                          value={editingOptionValues}
                          onChange={(e) => setEditingOptionValues(e.target.value)}
                        />
                      ) : (
                        option.values.join(', ')
                      )}
                    </TableCell>
                    <TableCell>
                      {editingOptionId === option.id ? (
                        <div className="flex space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => saveEditOption(option.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={cancelEditOption}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditOption(option)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(option.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {variants.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Product Variants</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>Price ($)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>SKU</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>{getAttributeDisplay(variant.attributes)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={variant.stock}
                        onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={variant.sku}
                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                        placeholder="SKU"
                        className="w-32"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {options.length === 0 && (
        <div className="rounded-md border border-dashed p-6 text-center">
          <p className="text-muted-foreground">Add product options like Size or Color to create variants</p>
        </div>
      )}
    </div>
  );
};

export default ProductVariations;