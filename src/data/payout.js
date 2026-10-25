// Banks and mobile-money networks by country, for teacher payout details.
// Countries not listed fall back to a free-text input in the UI.

export const BANKS_BY_COUNTRY = {
  Ghana: [
    'Absa Bank Ghana', 'Access Bank Ghana', 'Agricultural Development Bank (ADB)',
    'ARB Apex Bank', 'Bank of Africa Ghana', 'CalBank', 'Consolidated Bank Ghana (CBG)',
    'Ecobank Ghana', 'FBNBank Ghana', 'Fidelity Bank Ghana', 'First Atlantic Bank',
    'First National Bank Ghana', 'GCB Bank', 'Guaranty Trust Bank (GTBank) Ghana',
    'National Investment Bank (NIB)', 'OmniBSIC Bank', 'Prudential Bank',
    'Republic Bank Ghana', 'Société Générale Ghana', 'Stanbic Bank Ghana',
    'Standard Chartered Bank Ghana', 'United Bank for Africa (UBA) Ghana',
    'Universal Merchant Bank (UMB)', 'Zenith Bank Ghana',
  ],
  Nigeria: [
    'Access Bank', 'Citibank Nigeria', 'Ecobank Nigeria', 'Fidelity Bank',
    'First Bank of Nigeria', 'First City Monument Bank (FCMB)', 'Globus Bank',
    'Guaranty Trust Bank (GTBank)', 'Heritage Bank', 'Keystone Bank', 'Kuda Bank',
    'Polaris Bank', 'Providus Bank', 'Stanbic IBTC Bank', 'Standard Chartered Nigeria',
    'Sterling Bank', 'SunTrust Bank', 'Union Bank of Nigeria',
    'United Bank for Africa (UBA)', 'Unity Bank', 'Wema Bank', 'Zenith Bank',
  ],
  Kenya: [
    'ABSA Bank Kenya', 'Bank of Africa Kenya', 'Co-operative Bank of Kenya',
    'Diamond Trust Bank (DTB)', 'Equity Bank', 'Family Bank', 'I&M Bank',
    'KCB Bank', 'National Bank of Kenya', 'NCBA Bank', 'Stanbic Bank Kenya',
    'Standard Chartered Kenya',
  ],
  'South Africa': [
    'Absa', 'African Bank', 'Bidvest Bank', 'Capitec Bank', 'Discovery Bank',
    'First National Bank (FNB)', 'Investec', 'Nedbank', 'Standard Bank', 'TymeBank',
  ],
  Uganda: [
    'Absa Bank Uganda', 'Bank of Africa Uganda', 'Centenary Bank', 'DFCU Bank',
    'Equity Bank Uganda', 'Housing Finance Bank', 'KCB Bank Uganda', 'Stanbic Bank Uganda',
    'Standard Chartered Uganda', 'Tropical Bank',
  ],
  Tanzania: [
    'Absa Bank Tanzania', 'CRDB Bank', 'Equity Bank Tanzania', 'Exim Bank',
    'NBC (National Bank of Commerce)', 'NMB Bank', 'Stanbic Bank Tanzania',
    'Standard Chartered Tanzania',
  ],
  Rwanda: [
    'Bank of Kigali', 'BPR Bank (Atlas Mara)', 'Cogebanque', 'Ecobank Rwanda',
    'Equity Bank Rwanda', 'I&M Bank Rwanda', 'KCB Bank Rwanda',
  ],
}

export const MOMO_BY_COUNTRY = {
  Ghana: ['MTN Mobile Money', 'Telecel Cash', 'AirtelTigo Money'],
  Nigeria: ['OPay', 'PalmPay', 'Moniepoint', 'MoMo PSB (MTN)', 'Paga'],
  Kenya: ['M-Pesa (Safaricom)', 'Airtel Money', 'T-Kash (Telkom)'],
  Uganda: ['MTN Mobile Money', 'Airtel Money'],
  Tanzania: ['M-Pesa (Vodacom)', 'Tigo Pesa (Mixx by Yas)', 'Airtel Money', 'Halopesa'],
  Rwanda: ['MTN Mobile Money', 'Airtel Money'],
  Cameroon: ['MTN Mobile Money', 'Orange Money'],
  Senegal: ['Orange Money', 'Wave', 'Free Money'],
  "Ivory Coast": ['Orange Money', 'MTN Mobile Money', 'Moov Money', 'Wave'],
}
