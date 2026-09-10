import { NextResponse } from 'next/server'

const helpCategories = [
  {
    id: 'orders',
    title: 'Orders',
    icon: 'package',
    description: 'Track, modify, or cancel your orders',
    articles: [
      { id: 'ha1', title: 'How to track my order?', content: 'Go to Orders page and click on any order to see real-time tracking status. You can also use the tracking number in shipping confirmation email.' },
      { id: 'ha2', title: 'Can I modify my order after placing it?', content: 'Orders can be modified within 1 hour of placement. Go to Order Details and tap "Modify Order". After 1 hour, please contact support.' },
      { id: 'ha3', title: 'How to cancel an order?', content: 'Cancel from Order Details within 2 hours of placement. After processing begins, cancellation is not guaranteed. Contact support for assistance.' },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping',
    icon: 'truck',
    description: 'Delivery options and timelines',
    articles: [
      { id: 'ha4', title: 'What are the shipping options?', content: 'We offer Standard (5-7 days), Express (2-3 days), and Same-Day delivery in select areas. Digital services are delivered instantly.' },
      { id: 'ha5', title: 'How much does shipping cost?', content: 'Standard shipping is free on orders over $50. Express shipping starts at $9.99. Digital services have no shipping costs.' },
      { id: 'ha6', title: 'Do you ship internationally?', content: 'Currently, we serve domestic customers. International shipping is planned for Q2 2025. Digital services are available worldwide.' },
    ],
  },
  {
    id: 'returns',
    title: 'Returns',
    icon: 'rotate-ccw',
    description: 'Return policy and refund process',
    articles: [
      { id: 'ha7', title: 'What is the return policy?', content: 'Physical items: 30-day return window. Digital services: Satisfaction guarantee with full refund within 7 days if requirements are not met.' },
      { id: 'ha8', title: 'How long do refunds take?', content: 'Refunds are processed within 3-5 business days. The amount appears in your account within 5-10 business days depending on your payment method.' },
      { id: 'ha9', title: 'Can I exchange instead of refund?', content: 'Yes! Select "Exchange" when creating a return request. You can exchange for a different service tier or a different service altogether.' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: 'credit-card',
    description: 'Payment methods and billing',
    articles: [
      { id: 'ha10', title: 'What payment methods are accepted?', content: 'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, Google Pay, and Grapsee Wallet. Crypto payments coming soon.' },
      { id: 'ha11', title: 'Is my payment information secure?', content: 'Absolutely. We use 256-bit SSL encryption and never store your full card details. All payments are processed through PCI-compliant gateways.' },
      { id: 'ha12', title: 'How to apply a discount code?', content: 'Enter your discount code at checkout in the "Promo Code" field. The discount will be applied before payment. Only one code per order.' },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    icon: 'user',
    description: 'Manage your profile and settings',
    articles: [
      { id: 'ha13', title: 'How to reset my password?', content: 'Go to Settings > Account > Change Password. You can also use "Forgot Password" on the login screen to reset via email.' },
      { id: 'ha14', title: 'How to delete my account?', content: 'Go to Settings > Account > Delete Account. This action is permanent and cannot be undone. All data will be erased within 30 days.' },
      { id: 'ha15', title: 'How to update my email?', content: 'Go to Settings > Account > Email. Enter your new email and verify it. Your old email will receive a confirmation for security.' },
    ],
  },
  {
    id: 'products',
    title: 'Products',
    icon: 'shopping-bag',
    description: 'Product info and comparisons',
    articles: [
      { id: 'ha16', title: 'How to compare products?', content: 'Tap the compare icon on any product card. You can compare up to 3 products at a time across price, features, and specifications.' },
      { id: 'ha17', title: 'What do service tiers mean?', content: 'Basic: Essential features with standard delivery. Standard: Enhanced features with priority support. Premium: All features with VIP support and fastest delivery.' },
      { id: 'ha18', title: 'How to request a custom service?', content: 'Contact our support team via chat or email. Describe your requirements and we will provide a custom quote within 24 hours.' },
    ],
  },
]

const popularArticles = [
  { id: 'pop1', title: 'How to track my order?', category: 'Orders', views: 2450 },
  { id: 'pop2', title: 'What is the return policy?', category: 'Returns', views: 1890 },
  { id: 'pop3', title: 'What payment methods are accepted?', category: 'Payments', views: 1560 },
  { id: 'pop4', title: 'How to apply a discount code?', category: 'Payments', views: 1230 },
  { id: 'pop5', title: 'How to compare products?', category: 'Products', views: 980 },
]

export async function GET() {
  return NextResponse.json({
    categories: helpCategories,
    popularArticles,
  })
}
