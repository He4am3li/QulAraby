import React from 'react';
import { motion } from 'framer-motion';

export interface AvatarStyleProps {
  countryId: string;
  gender: 'male' | 'female';
  isSpeaking?: boolean;
  isListening?: boolean;
  isLoading?: boolean;
  audioLevel?: number;
  className?: string;
  imageSrc?: string;
  nameAr?: string;
}

// Visual configuration for each country and character based on authentic traditional attire
export const AVATAR_CONFIGS: Record<string, {
  male: {
    skinTone: string;
    hairColor: string;
    beard: boolean;
    headwearType: 'ghutra_white' | 'ghutra_red' | 'ghutra_red_fringed' | 'keffiyeh_palestine' | 'fez_red' | 'chechia_tunisia' | 'turban_oman' | 'turban_yemen' | 'turban_djibouti' | 'taqiyah_white' | 'kofia_comoros' | 'ghutra_cobra' | 'none';
    outfitType: 'bisht_gold' | 'kandura_grey' | 'dishdasha_white' | 'galabeya_saidi' | 'boubou_mauritania' | 'djellaba_morocco' | 'gandoura_algeria' | 'jebba_tunisia' | 'sherwal_lebanon' | 'shami_vest' | 'sudan_jalabiya' | 'oman_dishdasha' | 'yemen_futa' | 'djibouti_wrap' | 'somali_wrap' | 'comoros_kanzu';
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    accessory?: 'khanjar' | 'jambiya' | 'shawl' | 'tarboosha_tassel';
  };
  female: {
    skinTone: string;
    hairColor: string;
    headwearType: 'hijab_black' | 'sheila_black' | 'sheila_gold' | 'malhafa_blue' | 'hood_morocco' | 'scarf_white' | 'coin_headpiece_tunisia' | 'coin_headpiece_palestine' | 'bukhnuq_qatar' | 'mussar_oman' | 'headpiece_yemen' | 'scarf_yellow_flower' | 'toub_sudan' | 'dirac_orange' | 'pharaoh_crown' | 'none';
    outfitType: 'caftan_emerald' | 'karakou_white' | 'dress_tunisia' | 'rida_libya' | 'dress_pharaonic' | 'toub_sudan' | 'thobe_lebanon' | 'thobe_damascus' | 'thobe_tatreez' | 'daraa_kuwait' | 'abaya_saudi' | 'nashil_bahrain' | 'abaya_qatar' | 'mukhawar_uae' | 'dress_oman' | 'sitara_yemen' | 'dirac_djibouti' | 'dirac_somalia' | 'saluva_comoros' | 'dress_jordan' | 'hashimi_iraq' | 'malhafa_mauritania';
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    accessory?: 'khanjar' | 'jambiya' | 'shawl' | 'tarboosha_tassel';
    beard?: boolean;
  };
}> = {
  mauritania: {
    male: {
      skinTone: '#6b432c',
      hairColor: '#1a110d',
      beard: true,
      headwearType: 'none',
      outfitType: 'boubou_mauritania',
      primaryColor: '#1d4ed8',
      secondaryColor: '#2563eb',
      accentColor: '#f59e0b'
    },
    female: {
      skinTone: '#6b432c',
      hairColor: '#1a110d',
      headwearType: 'malhafa_blue',
      outfitType: 'malhafa_mauritania',
      primaryColor: '#1e3a8a',
      secondaryColor: '#3b82f6',
      accentColor: '#e2e8f0'
    }
  },
  morocco: {
    male: {
      skinTone: '#b6845d',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'none',
      outfitType: 'djellaba_morocco',
      primaryColor: '#78350f',
      secondaryColor: '#92400e',
      accentColor: '#fbbf24'
    },
    female: {
      skinTone: '#c9966f',
      hairColor: '#2b1b17',
      headwearType: 'hood_morocco',
      outfitType: 'caftan_emerald',
      primaryColor: '#047857',
      secondaryColor: '#065f46',
      accentColor: '#f59e0b'
    }
  },
  algeria: {
    male: {
      skinTone: '#c7946d',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'fez_red',
      outfitType: 'gandoura_algeria',
      primaryColor: '#f8fafc',
      secondaryColor: '#e2e8f0',
      accentColor: '#dc2626'
    },
    female: {
      skinTone: '#d4a27a',
      hairColor: '#2b1b17',
      headwearType: 'scarf_white',
      outfitType: 'karakou_white',
      primaryColor: '#fef3c7',
      secondaryColor: '#f8fafc',
      accentColor: '#d97706'
    }
  },
  tunisia: {
    male: {
      skinTone: '#b88760',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'chechia_tunisia',
      outfitType: 'jebba_tunisia',
      primaryColor: '#582f1b',
      secondaryColor: '#f8fafc',
      accentColor: '#b91c1c'
    },
    female: {
      skinTone: '#c8956e',
      hairColor: '#24140e',
      headwearType: 'coin_headpiece_tunisia',
      outfitType: 'dress_tunisia',
      primaryColor: '#1d4ed8',
      secondaryColor: '#dc2626',
      accentColor: '#cbd5e1'
    }
  },
  libya: {
    male: {
      skinTone: '#c08d64',
      hairColor: '#24140e',
      beard: false,
      headwearType: 'taqiyah_white',
      outfitType: 'dishdasha_white',
      primaryColor: '#f8fafc',
      secondaryColor: '#e2e8f0',
      accentColor: '#64748b'
    },
    female: {
      skinTone: '#cca07a',
      hairColor: '#24140e',
      headwearType: 'scarf_white',
      outfitType: 'rida_libya',
      primaryColor: '#3f6212',
      secondaryColor: '#ca8a04',
      accentColor: '#e2e8f0'
    }
  },
  egypt: {
    male: {
      skinTone: '#b8865d',
      hairColor: '#1f1612',
      beard: false,
      headwearType: 'none',
      outfitType: 'galabeya_saidi',
      primaryColor: '#57534e',
      secondaryColor: '#78716c',
      accentColor: '#f5f5f4'
    },
    female: {
      skinTone: '#c79870',
      hairColor: '#1a110d',
      headwearType: 'pharaoh_crown',
      outfitType: 'dress_pharaonic',
      primaryColor: '#fef3c7',
      secondaryColor: '#fde68a',
      accentColor: '#d97706'
    }
  },
  sudan: {
    male: {
      skinTone: '#54321f',
      hairColor: '#110c09',
      beard: true,
      headwearType: 'none',
      outfitType: 'sudan_jalabiya',
      primaryColor: '#ffffff',
      secondaryColor: '#fef08a',
      accentColor: '#ca8a04',
      accessory: 'shawl'
    },
    female: {
      skinTone: '#54321f',
      hairColor: '#110c09',
      headwearType: 'toub_sudan',
      outfitType: 'toub_sudan',
      primaryColor: '#f59e0b',
      secondaryColor: '#06b6d4',
      accentColor: '#ef4444'
    }
  },
  lebanon: {
    male: {
      skinTone: '#d4a27a',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'fez_red',
      outfitType: 'sherwal_lebanon',
      primaryColor: '#0f172a',
      secondaryColor: '#b91c1c',
      accentColor: '#f59e0b'
    },
    female: {
      skinTone: '#d8aa82',
      hairColor: '#24140e',
      headwearType: 'none',
      outfitType: 'thobe_lebanon',
      primaryColor: '#0f172a',
      secondaryColor: '#dc2626',
      accentColor: '#f59e0b'
    }
  },
  syria: {
    male: {
      skinTone: '#cfa078',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'ghutra_red',
      outfitType: 'shami_vest',
      primaryColor: '#78350f',
      secondaryColor: '#f8fafc',
      accentColor: '#dc2626'
    },
    female: {
      skinTone: '#d4a27a',
      hairColor: '#24140e',
      headwearType: 'none',
      outfitType: 'thobe_damascus',
      primaryColor: '#0f172a',
      secondaryColor: '#b91c1c',
      accentColor: '#e2e8f0'
    }
  },
  palestine: {
    male: {
      skinTone: '#be8c64',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'keffiyeh_palestine',
      outfitType: 'dishdasha_white',
      primaryColor: '#ffffff',
      secondaryColor: '#0f172a',
      accentColor: '#dc2626'
    },
    female: {
      skinTone: '#caa079',
      hairColor: '#24140e',
      headwearType: 'coin_headpiece_palestine',
      outfitType: 'thobe_tatreez',
      primaryColor: '#0f172a',
      secondaryColor: '#dc2626',
      accentColor: '#eab308'
    }
  },
  kuwait: {
    male: {
      skinTone: '#c7946d',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'ghutra_white',
      outfitType: 'bisht_gold',
      primaryColor: '#0f172a',
      secondaryColor: '#ffffff',
      accentColor: '#eab308'
    },
    female: {
      skinTone: '#d4a27a',
      hairColor: '#24140e',
      headwearType: 'hijab_black',
      outfitType: 'daraa_kuwait',
      primaryColor: '#0f172a',
      secondaryColor: '#1e293b',
      accentColor: '#f59e0b'
    }
  },
  saudi: {
    male: {
      skinTone: '#c28e67',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'ghutra_red',
      outfitType: 'bisht_gold',
      primaryColor: '#0f172a',
      secondaryColor: '#ffffff',
      accentColor: '#eab308'
    },
    female: {
      skinTone: '#caa079',
      hairColor: '#24140e',
      headwearType: 'sheila_black',
      outfitType: 'abaya_saudi',
      primaryColor: '#0f172a',
      secondaryColor: '#1e293b',
      accentColor: '#eab308'
    }
  },
  bahrain: {
    male: {
      skinTone: '#c7946d',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'ghutra_white',
      outfitType: 'dishdasha_white',
      primaryColor: '#ffffff',
      secondaryColor: '#f1f5f9',
      accentColor: '#0f172a'
    },
    female: {
      skinTone: '#d4a27a',
      hairColor: '#24140e',
      headwearType: 'sheila_gold',
      outfitType: 'nashil_bahrain',
      primaryColor: '#fef3c7',
      secondaryColor: '#fde68a',
      accentColor: '#d97706'
    }
  },
  qatar: {
    male: {
      skinTone: '#c7946d',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'ghutra_cobra',
      outfitType: 'dishdasha_white',
      primaryColor: '#ffffff',
      secondaryColor: '#f8fafc',
      accentColor: '#0f172a'
    },
    female: {
      skinTone: '#d4a27a',
      hairColor: '#24140e',
      headwearType: 'sheila_black',
      outfitType: 'abaya_qatar',
      primaryColor: '#0f172a',
      secondaryColor: '#fef3c7',
      accentColor: '#d97706'
    }
  },
  uae: {
    male: {
      skinTone: '#c7946d',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'ghutra_white',
      outfitType: 'kandura_grey',
      primaryColor: '#64748b',
      secondaryColor: '#94a3b8',
      accentColor: '#0f172a',
      accessory: 'tarboosha_tassel'
    },
    female: {
      skinTone: '#d4a27a',
      hairColor: '#24140e',
      headwearType: 'sheila_black',
      outfitType: 'mukhawar_uae',
      primaryColor: '#1e3a8a',
      secondaryColor: '#3b82f6',
      accentColor: '#eab308'
    }
  },
  oman: {
    male: {
      skinTone: '#b8865d',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'turban_oman',
      outfitType: 'oman_dishdasha',
      primaryColor: '#ffffff',
      secondaryColor: '#b45309',
      accentColor: '#cbd5e1',
      accessory: 'khanjar'
    },
    female: {
      skinTone: '#caa079',
      hairColor: '#24140e',
      headwearType: 'mussar_oman',
      outfitType: 'dress_oman',
      primaryColor: '#78350f',
      secondaryColor: '#451a03',
      accentColor: '#f59e0b'
    }
  },
  yemen: {
    male: {
      skinTone: '#ad7850',
      hairColor: '#1a110d',
      beard: true,
      headwearType: 'turban_yemen',
      outfitType: 'yemen_futa',
      primaryColor: '#1e293b',
      secondaryColor: '#ffffff',
      accentColor: '#059669',
      accessory: 'jambiya'
    },
    female: {
      skinTone: '#be8c64',
      hairColor: '#1a110d',
      headwearType: 'headpiece_yemen',
      outfitType: 'sitara_yemen',
      primaryColor: '#0f172a',
      secondaryColor: '#b91c1c',
      accentColor: '#e2e8f0'
    }
  },
  djibouti: {
    male: {
      skinTone: '#633c24',
      hairColor: '#110c09',
      beard: false,
      headwearType: 'turban_djibouti',
      outfitType: 'djibouti_wrap',
      primaryColor: '#dc2626',
      secondaryColor: '#ffffff',
      accentColor: '#f59e0b'
    },
    female: {
      skinTone: '#633c24',
      hairColor: '#110c09',
      headwearType: 'none',
      outfitType: 'dirac_djibouti',
      primaryColor: '#059669',
      secondaryColor: '#dc2626',
      accentColor: '#f59e0b'
    }
  },
  somalia: {
    male: {
      skinTone: '#54321f',
      hairColor: '#110c09',
      beard: false,
      headwearType: 'none',
      outfitType: 'somali_wrap',
      primaryColor: '#c2410c',
      secondaryColor: '#fef3c7',
      accentColor: '#78350f',
      accessory: 'shawl'
    },
    female: {
      skinTone: '#54321f',
      hairColor: '#110c09',
      headwearType: 'dirac_orange',
      outfitType: 'dirac_somalia',
      primaryColor: '#d97706',
      secondaryColor: '#78350f',
      accentColor: '#fbbf24'
    }
  },
  comoros: {
    male: {
      skinTone: '#5c3924',
      hairColor: '#110c09',
      beard: false,
      headwearType: 'kofia_comoros',
      outfitType: 'comoros_kanzu',
      primaryColor: '#ffffff',
      secondaryColor: '#0f172a',
      accentColor: '#b45309'
    },
    female: {
      skinTone: '#5c3924',
      hairColor: '#110c09',
      headwearType: 'scarf_yellow_flower',
      outfitType: 'saluva_comoros',
      primaryColor: '#eab308',
      secondaryColor: '#16a34a',
      accentColor: '#f97316'
    }
  },
  jordan: {
    male: {
      skinTone: '#c7946d',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'ghutra_red_fringed',
      outfitType: 'dishdasha_white',
      primaryColor: '#ffffff',
      secondaryColor: '#dc2626',
      accentColor: '#0f172a'
    },
    female: {
      skinTone: '#d4a27a',
      hairColor: '#24140e',
      headwearType: 'none',
      outfitType: 'dress_jordan',
      primaryColor: '#0f172a',
      secondaryColor: '#dc2626',
      accentColor: '#f59e0b'
    }
  },
  iraq: {
    male: {
      skinTone: '#be8c64',
      hairColor: '#24140e',
      beard: true,
      headwearType: 'keffiyeh_palestine',
      outfitType: 'dishdasha_white',
      primaryColor: '#ffffff',
      secondaryColor: '#0f172a',
      accentColor: '#334155'
    },
    female: {
      skinTone: '#cca07a',
      hairColor: '#24140e',
      headwearType: 'none',
      outfitType: 'hashimi_iraq',
      primaryColor: '#0f172a',
      secondaryColor: '#eab308',
      accentColor: '#fde047'
    }
  }
};

export const CountryTutorAvatar: React.FC<AvatarStyleProps> = ({
  countryId,
  gender,
  isSpeaking = false,
  isListening = false,
  imageSrc,
  className = ''
}) => {
  const config = AVATAR_CONFIGS[countryId]?.[gender] || AVATAR_CONFIGS.saudi[gender];
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);

  return (
    <div className={`relative w-full h-full flex items-end justify-center ${className}`}>
      {/* If remote image exists and hasn't failed, show it */}
      {imageSrc && !imageFailed && (
        <img
          src={imageSrc}
          alt={`${countryId} ${gender}`}
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
          className={`max-h-full w-auto object-contain object-bottom pointer-events-none select-none transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
          }`}
        />
      )}

      {/* Vector Fallback 3D Character Renderer matching authentic national clothes */}
      {(!imageSrc || imageFailed || !imageLoaded) && (
        <svg
          viewBox="0 0 200 320"
          className="w-auto h-full max-h-full drop-shadow-xl select-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Shading gradients */}
            <linearGradient id={`skinGrad-${countryId}-${gender}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.skinTone} stopOpacity="1" />
              <stop offset="100%" stopColor="#2b1b17" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id={`robeGrad-${countryId}-${gender}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={config.primaryColor} />
              <stop offset="100%" stopColor={config.secondaryColor} />
            </linearGradient>
            <radialGradient id={`fabricShine-${countryId}-${gender}`} cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
            </radialGradient>
          </defs>

          {/* Full Body Silhouette */}
          <g transform="translate(0, 10)">
            {/* Feet / Shoes */}
            <ellipse cx="80" cy="305" rx="14" ry="5" fill="#332219" />
            <ellipse cx="120" cy="305" rx="14" ry="5" fill="#332219" />

            {/* Main Robe / Dress Body */}
            <path
              d="M60,110 L140,110 L165,295 C165,300 155,305 100,305 C45,305 35,300 35,295 Z"
              fill={`url(#robeGrad-${countryId}-${gender})`}
            />
            {/* Fabric Highlight overlay */}
            <path
              d="M60,110 L140,110 L165,295 C165,300 155,305 100,305 C45,305 35,300 35,295 Z"
              fill={`url(#fabricShine-${countryId}-${gender})`}
            />

            {/* Special Robe Overlays / Bisht / Caftan Details */}
            {config.outfitType === 'bisht_gold' && (
              <>
                {/* Inner white Thobe */}
                <path d="M85,110 L115,110 L118,295 L82,295 Z" fill="#ffffff" />
                {/* Gold trim lines */}
                <path d="M85,110 L82,295" stroke={config.accentColor} strokeWidth="3.5" fill="none" />
                <path d="M115,110 L118,295" stroke={config.accentColor} strokeWidth="3.5" fill="none" />
                <path d="M85,110 Q100,135 115,110" stroke={config.accentColor} strokeWidth="4" fill="none" />
              </>
            )}

            {config.outfitType === 'caftan_emerald' && (
              <>
                {/* Central Skalli Gold Embroidery strip */}
                <path d="M96,110 L96,295" stroke="#f59e0b" strokeWidth="6" strokeDasharray="4 2" />
                {/* Golden belt (Mddama) */}
                <rect x="72" y="165" width="56" height="12" rx="3" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                <circle cx="100" cy="171" r="4" fill="#10b981" />
              </>
            )}

            {config.outfitType === 'thobe_tatreez' && (
              <>
                {/* Red cross-stitch chest panel */}
                <path d="M78,115 L122,115 L120,180 L80,180 Z" fill="#b91c1c" />
                <rect x="83" y="120" width="34" height="55" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                {/* Vertical red side panels */}
                <path d="M55,200 L68,295" stroke="#b91c1c" strokeWidth="5" />
                <path d="M145,200 L132,295" stroke="#b91c1c" strokeWidth="5" />
              </>
            )}

            {config.outfitType === 'boubou_mauritania' && (
              <>
                {/* Wide drape shoulders */}
                <path d="M25,120 Q100,105 175,120 L160,200 L40,200 Z" fill={config.primaryColor} opacity="0.8" />
                {/* Gold V-neck embroidery */}
                <path d="M80,110 L100,150 L120,110" stroke="#f59e0b" strokeWidth="3" fill="none" />
              </>
            )}

            {config.outfitType === 'djellaba_morocco' && (
              <>
                {/* Djellaba center Sfifa */}
                <path d="M100,110 L100,295" stroke="#fbbf24" strokeWidth="2.5" />
                {/* Pointed hood draping back */}
                <path d="M68,70 Q100,20 132,70 L140,115 Q100,125 60,115 Z" fill="#602808" />
              </>
            )}

            {config.outfitType === 'dress_pharaonic' && (
              <>
                {/* Golden Usekh broad collar necklace */}
                <path d="M70,105 Q100,140 130,105" stroke="#f59e0b" strokeWidth="12" fill="none" />
                <path d="M74,105 Q100,135 126,105" stroke="#0284c7" strokeWidth="3" fill="none" />
                {/* Golden belt sash */}
                <rect x="78" y="165" width="44" height="7" fill="#f59e0b" />
                <path d="M96,172 L96,250" stroke="#f59e0b" strokeWidth="8" />
              </>
            )}

            {config.outfitType === 'toub_sudan' && (
              <>
                {/* Multi-color diagonal swirl wrap */}
                <path d="M40,140 Q100,110 160,160 L145,260 Q100,290 55,240 Z" fill="#ef4444" opacity="0.85" />
                <path d="M50,170 Q100,140 150,190" stroke="#06b6d4" strokeWidth="8" fill="none" />
                <path d="M55,190 Q100,160 145,210" stroke="#eab308" strokeWidth="8" fill="none" />
              </>
            )}

            {config.outfitType === 'yemen_futa' && (
              <>
                {/* Plaid Mawaz lower wrap */}
                <rect x="62" y="180" width="76" height="115" rx="4" fill="#334155" />
                <line x1="62" y1="210" x2="138" y2="210" stroke="#059669" strokeWidth="2" />
                <line x1="62" y1="245" x2="138" y2="245" stroke="#f8fafc" strokeWidth="2" />
                <line x1="85" y1="180" x2="85" y2="295" stroke="#059669" strokeWidth="2" />
                <line x1="115" y1="180" x2="115" y2="295" stroke="#f8fafc" strokeWidth="2" />
                {/* Jambiya green belt */}
                <rect x="66" y="172" width="68" height="12" rx="2" fill="#059669" stroke="#f59e0b" strokeWidth="1" />
                {/* Curved Jambiya Dagger */}
                <path d="M100,174 Q105,195 118,198" stroke="#f59e0b" strokeWidth="5" fill="none" strokeLinecap="round" />
                <circle cx="100" cy="174" r="3" fill="#cbd5e1" />
              </>
            )}

            {config.accessory === 'khanjar' && (
              <>
                {/* Omani Curved Silver Khanjar */}
                <rect x="74" y="170" width="52" height="10" fill="#94a3b8" />
                <path d="M100,172 Q106,192 120,194" stroke="#cbd5e1" strokeWidth="6" fill="none" strokeLinecap="round" />
                <circle cx="100" cy="172" r="3.5" fill="#f59e0b" />
              </>
            )}

            {config.accessory === 'tarboosha_tassel' && (
              /* Emirati long chest tassel (Tarboosha) */
              <path d="M100,110 L100,150" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            )}

            {/* Neck */}
            <rect x="91" y="90" width="18" height="25" rx="3" fill={config.skinTone} />

            {/* Head Silhouette */}
            <ellipse cx="100" cy="70" rx="26" ry="30" fill={config.skinTone} />

            {/* Ears */}
            <ellipse cx="73" cy="70" rx="4" ry="7" fill={config.skinTone} />
            <ellipse cx="127" cy="70" rx="4" ry="7" fill={config.skinTone} />

            {/* Hair / Beard */}
            {gender === 'male' && config.beard && (
              <path d="M78,72 Q100,104 122,72 Q120,95 100,98 Q80,95 78,72 Z" fill={config.hairColor} />
            )}

            {/* Friendly Facial Features */}
            {/* Eyebrows */}
            <path d="M83,57 Q91,54 96,57" stroke={config.hairColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M104,57 Q109,54 117,57" stroke={config.hairColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Expressive Eyes */}
            <ellipse cx="89" cy="65" rx="3.5" ry="4" fill="#20140e" />
            <ellipse cx="111" cy="65" rx="3.5" ry="4" fill="#20140e" />
            {/* Eye sparkle */}
            <circle cx="88" cy="63.5" r="1.2" fill="#ffffff" />
            <circle cx="110" cy="63.5" r="1.2" fill="#ffffff" />

            {/* Cute Nose */}
            <path d="M100,64 L98,73 L102,73" stroke="#523223" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Smiling Lips */}
            <path
              d={isSpeaking ? "M93,82 Q100,90 107,82 Q100,86 93,82 Z" : "M93,82 Q100,88 107,82"}
              fill={isSpeaking ? "#b91c1c" : "none"}
              stroke="#991b1b"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Headgear Layer */}
            {/* Red Fez / Tarboosh (Morocco / Algeria / Tunisia / Lebanon) */}
            {(config.headwearType === 'fez_red' || config.headwearType === 'chechia_tunisia') && (
              <g>
                <path d="M80,48 L84,22 L116,22 L120,48 Z" fill="#b91c1c" />
                <ellipse cx="100" cy="22" rx="16" ry="3" fill="#991b1b" />
                {/* Black tassel hanging down */}
                <path d="M100,22 Q122,25 125,50" stroke="#0f172a" strokeWidth="1.8" fill="none" />
              </g>
            )}

            {/* White Ghutra / Keffiyeh */}
            {config.headwearType === 'ghutra_white' && (
              <g>
                {/* White cloth draped over head */}
                <path d="M72,55 Q100,25 128,55 L138,135 Q100,120 62,135 Z" fill="#ffffff" />
                {/* Black Agal cord */}
                <ellipse cx="100" cy="46" rx="22" ry="5" fill="none" stroke="#0f172a" strokeWidth="4" />
                <ellipse cx="100" cy="50" rx="22" ry="5" fill="none" stroke="#0f172a" strokeWidth="4" />
              </g>
            )}

            {/* Red / White Shemagh */}
            {(config.headwearType === 'ghutra_red' || config.headwearType === 'ghutra_red_fringed') && (
              <g>
                <path d="M72,55 Q100,25 128,55 L138,135 Q100,120 62,135 Z" fill="#dc2626" />
                {/* Checkered pattern */}
                <path d="M75,55 L125,115 M125,55 L75,115" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* Black Agal */}
                <ellipse cx="100" cy="46" rx="22" ry="5" fill="none" stroke="#0f172a" strokeWidth="4" />
                <ellipse cx="100" cy="50" rx="22" ry="5" fill="none" stroke="#0f172a" strokeWidth="4" />
                {config.headwearType === 'ghutra_red_fringed' && (
                  /* Jordanian white fringe (Hadab) */
                  <path d="M62,135 Q100,120 138,135" stroke="#ffffff" strokeWidth="3" strokeDasharray="2 2" fill="none" />
                )}
              </g>
            )}

            {/* Palestinian Black-and-White Keffiyeh */}
            {config.headwearType === 'keffiyeh_palestine' && (
              <g>
                <path d="M72,55 Q100,25 128,55 L138,135 Q100,120 62,135 Z" fill="#ffffff" />
                {/* Fishnet black pattern */}
                <path d="M76,55 L124,115 M124,55 L76,115" stroke="#0f172a" strokeWidth="1.2" strokeDasharray="3 2" />
                {/* Black Agal */}
                <ellipse cx="100" cy="46" rx="22" ry="5" fill="none" stroke="#0f172a" strokeWidth="4" />
                <ellipse cx="100" cy="50" rx="22" ry="5" fill="none" stroke="#0f172a" strokeWidth="4" />
              </g>
            )}

            {/* Omani Mussar / Colorful Embroidered Turban */}
            {config.headwearType === 'turban_oman' && (
              <g>
                <path d="M74,52 Q100,20 126,52 Q115,28 100,28 Q85,28 74,52 Z" fill="#b45309" />
                <path d="M76,46 Q100,32 124,46" stroke="#f59e0b" strokeWidth="4" fill="none" />
                <path d="M78,52 Q100,38 122,52" stroke="#dc2626" strokeWidth="3" fill="none" />
              </g>
            )}

            {/* Comoros Kofia Cap */}
            {config.headwearType === 'kofia_comoros' && (
              <g>
                <rect x="77" y="32" width="46" height="18" rx="3" fill="#78350f" />
                <path d="M77,40 L123,40" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 2" />
              </g>
            )}

            {/* Female Modest Sheila / Hijab */}
            {config.headwearType === 'sheila_black' && (
              <g>
                <path d="M70,55 Q100,22 130,55 L135,135 Q100,140 65,135 Z" fill="#0f172a" opacity="0.95" />
                {/* Face cutout oval */}
                <ellipse cx="100" cy="70" rx="22" ry="26" fill={config.skinTone} />
                {/* Re-render face on top */}
                <ellipse cx="89" cy="65" rx="3" ry="3.5" fill="#20140e" />
                <ellipse cx="111" cy="65" rx="3" ry="3.5" fill="#20140e" />
                <circle cx="88" cy="63.5" r="1.2" fill="#ffffff" />
                <circle cx="110" cy="63.5" r="1.2" fill="#ffffff" />
                <path d="M93,82 Q100,88 107,82" stroke="#e11d48" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* Female Golden Sheila / Bahrain / Qatar */}
            {config.headwearType === 'sheila_gold' && (
              <g>
                <path d="M70,55 Q100,22 130,55 L135,135 Q100,140 65,135 Z" fill="#fef3c7" opacity="0.95" />
                <path d="M70,55 Q100,22 130,55" stroke="#d97706" strokeWidth="3" fill="none" />
                <ellipse cx="100" cy="70" rx="22" ry="26" fill={config.skinTone} />
                <ellipse cx="89" cy="65" rx="3" ry="3.5" fill="#20140e" />
                <ellipse cx="111" cy="65" rx="3" ry="3.5" fill="#20140e" />
                <circle cx="88" cy="63.5" r="1.2" fill="#ffffff" />
                <circle cx="110" cy="63.5" r="1.2" fill="#ffffff" />
                <path d="M93,82 Q100,88 107,82" stroke="#e11d48" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* Tunisian / Palestinian Coin Headpiece */}
            {(config.headwearType === 'coin_headpiece_tunisia' || config.headwearType === 'coin_headpiece_palestine') && (
              <g>
                <path d="M76,52 Q100,42 124,52" stroke="#f59e0b" strokeWidth="3" fill="none" />
                {[78, 86, 94, 100, 106, 114, 122].map((x, i) => (
                  <circle key={i} cx={x} cy={55} r="2.2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
                ))}
              </g>
            )}

            {/* Comoros Yellow Flower in Hair */}
            {config.headwearType === 'scarf_yellow_flower' && (
              <g>
                <path d="M70,55 Q100,25 130,55 L132,110 Q100,120 68,110 Z" fill="#eab308" />
                <circle cx="125" cy="45" r="7" fill="#ef4444" />
                <circle cx="125" cy="45" r="3" fill="#fde047" />
              </g>
            )}
          </g>
        </svg>
      )}
    </div>
  );
};
