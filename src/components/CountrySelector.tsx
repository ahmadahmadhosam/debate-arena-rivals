
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

const countries: Country[] = [
  // البلدان العربية
  { code: 'PS', name: 'فلسطين', flag: '🇵🇸', dialCode: '+970' },
  { code: 'SA', name: 'السعودية', flag: '🇸🇦', dialCode: '+966' },
  { code: 'AE', name: 'الإمارات', flag: '🇦🇪', dialCode: '+971' },
  { code: 'EG', name: 'مصر', flag: '🇪🇬', dialCode: '+20' },
  { code: 'JO', name: 'الأردن', flag: '🇯🇴', dialCode: '+962' },
  { code: 'LB', name: 'لبنان', flag: '🇱🇧', dialCode: '+961' },
  { code: 'SY', name: 'سوريا', flag: '🇸🇾', dialCode: '+963' },
  { code: 'IQ', name: 'العراق', flag: '🇮🇶', dialCode: '+964' },
  { code: 'KW', name: 'الكويت', flag: '🇰🇼', dialCode: '+965' },
  { code: 'QA', name: 'قطر', flag: '🇶🇦', dialCode: '+974' },
  { code: 'BH', name: 'البحرين', flag: '🇧🇭', dialCode: '+973' },
  { code: 'OM', name: 'عمان', flag: '🇴🇲', dialCode: '+968' },
  { code: 'YE', name: 'اليمن', flag: '🇾🇪', dialCode: '+967' },
  { code: 'MA', name: 'المغرب', flag: '🇲🇦', dialCode: '+212' },
  { code: 'DZ', name: 'الجزائر', flag: '🇩🇿', dialCode: '+213' },
  { code: 'TN', name: 'تونس', flag: '🇹🇳', dialCode: '+216' },
  { code: 'LY', name: 'ليبيا', flag: '🇱🇾', dialCode: '+218' },
  { code: 'SD', name: 'السودان', flag: '🇸🇩', dialCode: '+249' },
  { code: 'SO', name: 'الصومال', flag: '🇸🇴', dialCode: '+252' },
  { code: 'DJ', name: 'جيبوتي', flag: '🇩🇯', dialCode: '+253' },
  { code: 'KM', name: 'جزر القمر', flag: '🇰🇲', dialCode: '+269' },
  { code: 'MR', name: 'موريتانيا', flag: '🇲🇷', dialCode: '+222' },
  
  // البلدان الإسلامية
  { code: 'TR', name: 'تركيا', flag: '🇹🇷', dialCode: '+90' },
  { code: 'IR', name: 'إيران', flag: '🇮🇷', dialCode: '+98' },
  { code: 'PK', name: 'باكستان', flag: '🇵🇰', dialCode: '+92' },
  { code: 'AF', name: 'أفغانستان', flag: '🇦🇫', dialCode: '+93' },
  { code: 'BD', name: 'بنغلاديش', flag: '🇧🇩', dialCode: '+880' },
  { code: 'ID', name: 'إندونيسيا', flag: '🇮🇩', dialCode: '+62' },
  { code: 'MY', name: 'ماليزيا', flag: '🇲🇾', dialCode: '+60' },
  { code: 'BN', name: 'بروناي', flag: '🇧🇳', dialCode: '+673' },
  { code: 'MV', name: 'المالديف', flag: '🇲🇻', dialCode: '+960' },
  { code: 'UZ', name: 'أوزبكستان', flag: '🇺🇿', dialCode: '+998' },
  { code: 'KZ', name: 'كازاخستان', flag: '🇰🇿', dialCode: '+7' },
  { code: 'KG', name: 'قيرغيزستان', flag: '🇰🇬', dialCode: '+996' },
  { code: 'TJ', name: 'طاجيكستان', flag: '🇹🇯', dialCode: '+992' },
  { code: 'TM', name: 'تركمانستان', flag: '🇹🇲', dialCode: '+993' },
  { code: 'AZ', name: 'أذربيجان', flag: '🇦🇿', dialCode: '+994' },
  { code: 'AL', name: 'ألبانيا', flag: '🇦🇱', dialCode: '+355' },
  { code: 'BA', name: 'البوسنة والهرسك', flag: '🇧🇦', dialCode: '+387' },
  { code: 'XK', name: 'كوسوفو', flag: '🇽🇰', dialCode: '+383' },
  
  // دول أفريقية أخرى
  { code: 'NG', name: 'نيجيريا', flag: '🇳🇬', dialCode: '+234' },
  { code: 'SN', name: 'السنغال', flag: '🇸🇳', dialCode: '+221' },
  { code: 'ML', name: 'مالي', flag: '🇲🇱', dialCode: '+223' },
  { code: 'BF', name: 'بوركينا فاسو', flag: '🇧🇫', dialCode: '+226' },
  { code: 'NE', name: 'النيجر', flag: '🇳🇪', dialCode: '+227' },
  { code: 'TD', name: 'تشاد', flag: '🇹🇩', dialCode: '+235' },
  { code: 'GM', name: 'غامبيا', flag: '🇬🇲', dialCode: '+220' },
  { code: 'GN', name: 'غينيا', flag: '🇬🇳', dialCode: '+224' },
  { code: 'SL', name: 'سيراليون', flag: '🇸🇱', dialCode: '+232' },
  { code: 'CI', name: 'ساحل العاج', flag: '🇨🇮', dialCode: '+225' },
  
  // دول أوروبية وأمريكية
  { code: 'US', name: 'الولايات المتحدة', flag: '🇺🇸', dialCode: '+1' },
  { code: 'CA', name: 'كندا', flag: '🇨🇦', dialCode: '+1' },
  { code: 'GB', name: 'المملكة المتحدة', flag: '🇬🇧', dialCode: '+44' },
  { code: 'FR', name: 'فرنسا', flag: '🇫🇷', dialCode: '+33' },
  { code: 'DE', name: 'ألمانيا', flag: '🇩🇪', dialCode: '+49' },
  { code: 'IT', name: 'إيطاليا', flag: '🇮🇹', dialCode: '+39' },
  { code: 'ES', name: 'إسبانيا', flag: '🇪🇸', dialCode: '+34' },
  { code: 'NL', name: 'هولندا', flag: '🇳🇱', dialCode: '+31' },
  { code: 'BE', name: 'بلجيكا', flag: '🇧🇪', dialCode: '+32' },
  { code: 'SE', name: 'السويد', flag: '🇸🇪', dialCode: '+46' },
  { code: 'NO', name: 'النرويج', flag: '🇳🇴', dialCode: '+47' },
  { code: 'DK', name: 'الدانمارك', flag: '🇩🇰', dialCode: '+45' },
  { code: 'FI', name: 'فنلندا', flag: '🇫🇮', dialCode: '+358' },
  { code: 'CH', name: 'سويسرا', flag: '🇨🇭', dialCode: '+41' },
  { code: 'AT', name: 'النمسا', flag: '🇦🇹', dialCode: '+43' },
  { code: 'AU', name: 'أستراليا', flag: '🇦🇺', dialCode: '+61' },
  { code: 'NZ', name: 'نيوزيلندا', flag: '🇳🇿', dialCode: '+64' },
  
  // دول آسيوية أخرى
  { code: 'CN', name: 'الصين', flag: '🇨🇳', dialCode: '+86' },
  { code: 'JP', name: 'اليابان', flag: '🇯🇵', dialCode: '+81' },
  { code: 'KR', name: 'كوريا الجنوبية', flag: '🇰🇷', dialCode: '+82' },
  { code: 'IN', name: 'الهند', flag: '🇮🇳', dialCode: '+91' },
  { code: 'TH', name: 'تايلاند', flag: '🇹🇭', dialCode: '+66' },
  { code: 'VN', name: 'فيتنام', flag: '🇻🇳', dialCode: '+84' },
  { code: 'PH', name: 'الفلبين', flag: '🇵🇭', dialCode: '+63' },
  { code: 'SG', name: 'سنغافورة', flag: '🇸🇬', dialCode: '+65' },
  { code: 'LK', name: 'سريلانكا', flag: '🇱🇰', dialCode: '+94' },
  { code: 'MM', name: 'ميانمار', flag: '🇲🇲', dialCode: '+95' },
  { code: 'KH', name: 'كمبوديا', flag: '🇰🇭', dialCode: '+855' },
  { code: 'LA', name: 'لاوس', flag: '🇱🇦', dialCode: '+856' },
  { code: 'MN', name: 'منغوليا', flag: '🇲🇳', dialCode: '+976' },
  { code: 'NP', name: 'نيبال', flag: '🇳🇵', dialCode: '+977' },
  { code: 'BT', name: 'بوتان', flag: '🇧🇹', dialCode: '+975' },
  
  // دول أمريكا اللاتينية
  { code: 'BR', name: 'البرازيل', flag: '🇧🇷', dialCode: '+55' },
  { code: 'AR', name: 'الأرجنتين', flag: '🇦🇷', dialCode: '+54' },
  { code: 'MX', name: 'المكسيك', flag: '🇲🇽', dialCode: '+52' },
  { code: 'CL', name: 'تشيلي', flag: '🇨🇱', dialCode: '+56' },
  { code: 'CO', name: 'كولومبيا', flag: '🇨🇴', dialCode: '+57' },
  { code: 'PE', name: 'بيرو', flag: '🇵🇪', dialCode: '+51' },
  { code: 'VE', name: 'فنزويلا', flag: '🇻🇪', dialCode: '+58' },
  { code: 'EC', name: 'الإكوادور', flag: '🇪🇨', dialCode: '+593' },
  { code: 'UY', name: 'أوروغواي', flag: '🇺🇾', dialCode: '+598' },
  { code: 'PY', name: 'باراغواي', flag: '🇵🇾', dialCode: '+595' },
  { code: 'BO', name: 'بوليفيا', flag: '🇧🇴', dialCode: '+591' },
  
  // دول أخرى
  { code: 'RU', name: 'روسيا', flag: '🇷🇺', dialCode: '+7' },
  { code: 'UA', name: 'أوكرانيا', flag: '🇺🇦', dialCode: '+380' },
  { code: 'PL', name: 'بولندا', flag: '🇵🇱', dialCode: '+48' },
  { code: 'CZ', name: 'التشيك', flag: '🇨🇿', dialCode: '+420' },
  { code: 'SK', name: 'سلوفاكيا', flag: '🇸🇰', dialCode: '+421' },
  { code: 'HU', name: 'المجر', flag: '🇭🇺', dialCode: '+36' },
  { code: 'RO', name: 'رومانيا', flag: '🇷🇴', dialCode: '+40' },
  { code: 'BG', name: 'بلغاريا', flag: '🇧🇬', dialCode: '+359' },
  { code: 'GR', name: 'اليونان', flag: '🇬🇷', dialCode: '+30' },
  { code: 'CY', name: 'قبرص', flag: '🇨🇾', dialCode: '+357' },
  { code: 'MT', name: 'مالطا', flag: '🇲🇹', dialCode: '+356' },
  { code: 'IS', name: 'أيسلندا', flag: '🇮🇸', dialCode: '+354' },
  { code: 'IE', name: 'أيرلندا', flag: '🇮🇪', dialCode: '+353' },
  { code: 'PT', name: 'البرتغال', flag: '🇵🇹', dialCode: '+351' },
  { code: 'LU', name: 'لوكسمبورغ', flag: '🇱🇺', dialCode: '+352' },
  { code: 'MC', name: 'موناكو', flag: '🇲🇨', dialCode: '+377' },
  { code: 'AD', name: 'أندورا', flag: '🇦🇩', dialCode: '+376' },
  { code: 'SM', name: 'سان مارينو', flag: '🇸🇲', dialCode: '+378' },
  { code: 'VA', name: 'الفاتيكان', flag: '🇻🇦', dialCode: '+379' },
  { code: 'LI', name: 'ليختنشتاين', flag: '🇱🇮', dialCode: '+423' }
];

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onCountryChange: (country: Country) => void;
}

const CountrySelector = ({ selectedCountry, onCountryChange }: CountrySelectorProps) => {
  return (
    <Select
      value={selectedCountry?.code || ''}
      onValueChange={(code) => {
        const country = countries.find(c => c.code === code);
        if (country) {
          onCountryChange(country);
        }
      }}
    >
      <SelectTrigger className="w-full border-2 border-blue-300 focus:border-blue-500 dark:border-blue-600">
        <SelectValue placeholder="اختر البلد">
          {selectedCountry && (
            <div className="flex items-center gap-2">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
              <span className="text-gray-500">({selectedCountry.dialCode})</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.name}</span>
              <span className="text-gray-500">({country.dialCode})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountrySelector;
export type { Country };
