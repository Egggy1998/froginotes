import React from 'react';
import { Zap, Cloud, Search, CheckSquare } from 'lucide-react';
import { FrogMascot } from '../mascots/FrogMascot';

interface FeatureCardProps {
  bg: string;
  borderColor: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  bg,
  borderColor,
  icon,
  title,
  description,
}) => {
  return (
    <div
      className={`${bg} ${borderColor} border rounded-[22px] p-6 flex flex-col items-center text-center shadow-[0_6px_20px_rgba(40,70,45,0.04)] hover:shadow-[0_16px_36px_rgba(40,70,45,0.12)] hover:-translate-y-2.5 transition-all duration-300 cursor-pointer group`}
    >
      {/* Icon Container */}
      <div className="w-14 h-14 rounded-2xl bg-white/90 border border-black/5 flex items-center justify-center mb-4 shadow-xs group-hover:scale-115 group-hover:rotate-8 group-hover:shadow-md transition-all duration-300">
        {icon}
      </div>

      {/* Title */}
      <h3 className="font-rounded font-extrabold text-[16px] text-[#19271D] mb-1.5 tracking-tight group-hover:text-[#284E34] transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs text-[#526456] leading-relaxed max-w-[170px] group-hover:text-[#19271D] transition-colors">
        {description}
      </p>
    </div>
  );
};

export const FeatureSection: React.FC = () => {
  const features: FeatureCardProps[] = [
    {
      bg: 'bg-[#FEF9E7]',
      borderColor: 'border-[#F8EAC2]',
      icon: <Zap size={22} className="text-[#D9822B] stroke-[2.2]" />,
      title: 'Ghi chú nhanh',
      description: 'Ghi ý tưởng chỉ trong vài giây.',
    },
    {
      bg: 'bg-[#EBF5FB]',
      borderColor: 'border-[#CFE5F5]',
      icon: <Cloud size={22} className="text-[#3A88C8] stroke-[2.2]" />,
      title: 'Tự động lưu',
      description: 'An toàn, không lo mất.',
    },
    {
      bg: 'bg-[#FFF9E6]',
      borderColor: 'border-[#F8EBBD]',
      icon: <Search size={22} className="text-[#CCA028] stroke-[2.2]" />,
      title: 'Tìm kiếm dễ',
      description: 'Tìm ghi chú nhanh chóng.',
    },
    {
      bg: 'bg-[#FDF2F4]',
      borderColor: 'border-[#F8D5DB]',
      icon: <FrogMascot mood="happy" size={26} />,
      title: 'Thu gọn bong bóng',
      description: 'Luôn bên bạn trên desktop.',
    },
    {
      bg: 'bg-[#EAF7EE]',
      borderColor: 'border-[#C8E9D1]',
      icon: <CheckSquare size={22} className="text-[#3D8F52] stroke-[2.2]" />,
      title: 'Checklist tiện lợi',
      description: 'Lên danh sách dễ dàng.',
    },
  ];

  return (
    <section id="features" className="w-full py-16 select-none">
      <div className="max-w-[1220px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="h-[1.5px] w-8 bg-[#8BB883] rounded-full" />
          <span className="h-[1.5px] w-4 bg-[#8BB883] rounded-full" />
          <h2 className="font-rounded font-extrabold text-[28px] sm:text-[32px] text-[#19271D] tracking-tight">
            Tính năng nổi bật
          </h2>
          <span className="h-[1.5px] w-4 bg-[#8BB883] rounded-full" />
          <span className="h-[1.5px] w-8 bg-[#8BB883] rounded-full" />
        </div>

        {/* 5 Feature Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4.5">
          {features.map((feat) => (
            <FeatureCard key={feat.title} {...feat} />
          ))}
        </div>
      </div>
    </section>
  );
};
