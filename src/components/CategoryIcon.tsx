import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Home,
  Zap,
  Shirt,
  HeartPulse,
  GraduationCap,
  Users,
  Dog,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  RefreshCw,
  Wallet,
  CreditCard,
  MessageSquare,
  Banknote,
  Layers,
  Tag,
  CircleDollarSign,
  Coffee,
  Plane,
  Smartphone,
  BookOpen,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Home,
  Zap,
  Shirt,
  HeartPulse,
  GraduationCap,
  Users,
  Dog,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  RefreshCw,
  Wallet,
  CreditCard,
  MessageSquare,
  Banknote,
  Layers,
  Tag,
  CircleDollarSign,
  Coffee,
  Plane,
  Smartphone,
  BookOpen,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  size = 20,
  style,
}) => {
  const IconComponent = ICON_MAP[name] || Tag;
  return <IconComponent className={className} size={size} style={style} />;
};
