import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Currency } from '@/types/wallet';

interface CurrencyLogoProps {
  currency: Currency;
  size?: number;
}

export default function CurrencyLogo({ currency, size = 40 }: CurrencyLogoProps) {
  // Use the logoUrl from the currency if available
  if (currency.logoUrl) {
    return (
      <Image
        source={{ uri: currency.logoUrl }}
        style={[
          styles.logo,
          { width: size, height: size, borderRadius: size / 2 }
        ]}
        contentFit="cover"
      />
    );
  }
  
  // Fallback to color circle with symbol
  return (
    <View
      style={[
        styles.fallbackLogo,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: currency.color,
        },
      ]}
    >
      <Image
        source={{ uri: getCryptoLogoUrl(currency.id) }}
        style={[
          styles.logo,
          { width: size * 0.8, height: size * 0.8 }
        ]}
        contentFit="contain"
      />
    </View>
  );
}

// Function to get cryptocurrency logo URLs
function getCryptoLogoUrl(currencyId: string): string {
  const logos: Record<string, string> = {
    btc: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    eth: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    usdt: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
    usdc: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
    bnb: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    xrp: 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
    sol: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    ada: 'https://cryptologos.cc/logos/cardano-ada-logo.png',
    avax: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
    doge: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
    dot: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
    matic: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    link: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    ltc: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
    uni: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    shib: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
  };
  
  return logos[currencyId.toLowerCase()] || 'https://cryptologos.cc/logos/bitcoin-btc-logo.png';
}

const styles = StyleSheet.create({
  logo: {
    overflow: 'hidden',
  },
  fallbackLogo: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});