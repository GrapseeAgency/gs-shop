// External API Integration for Real Card Validation
// All APIs are FREE - no signup required

export interface ExternalAPIResult {
  success: boolean;
  data?: any;
  error?: string;
  source: string;
}

// Simple in-memory cache for bank data (100 requests/month limit)
const bankDataCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache helper functions
function getCachedData(key: string): any | null {
  const cached = bankDataCache.get(key);
  if (cached && Date.now() < cached.timestamp + cached.ttl) {
    console.log(`[CACHE] Hit for key: ${key}`);
    return cached.data;
  }
  if (cached) {
    bankDataCache.delete(key);
  }
  return null;
}

function setCachedData(key: string, data: any, ttlMinutes: number = 60): void {
  console.log(`[CACHE] Set for key: ${key}, TTL: ${ttlMinutes} minutes`);
  bankDataCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000 // Convert to milliseconds
  });
}

// Clean up expired cache entries periodically
function cleanupCache(): void {
  const now = Date.now();
  bankDataCache.forEach((value, key) => {
    if (now > value.timestamp + value.ttl) {
      bankDataCache.delete(key);
    }
  });
}

// Run cleanup every 10 minutes
setInterval(cleanupCache, 10 * 60 * 1000);

// BIN Lookup - External APIs
export async function lookupBINExternal(bin: string): Promise<ExternalAPIResult> {
  const apis = [
    {
      name: 'BIN Search Lookup',
      url: `${process.env.BIN_API_URL || 'https://api.binsearchlookup.com'}/lookup?bin=${bin}`,
      headers: {
        'X-API-Key': process.env.BIN_API_KEY || '',
        'X-User-ID': process.env.BIN_USER_ID || ''
      },
      timeout: 10000
    },
    {
      name: 'BinList.net',
      url: `${process.env.BIN_LOOKUP_API_URL || 'https://api.binlist.net/'}${bin}`,
      headers: { 'Accept-Version': '3' },
      timeout: 10000
    }
  ];

  for (const api of apis) {
    try {
      console.log(`[EXTERNAL_API] Trying ${api.name} for BIN: ${bin}`);
      
      const response = await fetch(api.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'GrapseeShop/1.0',
          ...api.headers
        },
        signal: AbortSignal.timeout(api.timeout)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data && (data.scheme || data.brand || data.bank)) {
          console.log(`[EXTERNAL_API] ${api.name} success: ${data.scheme || data.brand}`);
          
          return {
            success: true,
            data: {
              scheme: data.scheme || data.brand || 'unknown',
              type: data.type || 'unknown',
              brand: data.brand || data.scheme || 'unknown',
              bank: {
                name: data.bank?.name || 'Unknown Bank',
                country: {
                  alpha2: data.country?.alpha2 || data.bank?.country?.alpha2 || 'XX',
                  name: data.country?.name || data.bank?.country?.name || 'Unknown',
                  currency: data.country?.currency || data.bank?.country?.currency || 'USD'
                }
              },
              prepaid: data.prepaid || false
            },
            source: api.name
          };
        }
      }
    } catch (error) {
      console.log(`[EXTERNAL_API] ${api.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      continue;
    }
  }

  console.log(`[EXTERNAL_API] All BIN APIs failed for BIN: ${bin}`);
  return { success: false, error: 'All external APIs failed', source: 'BIN_LOOKUP' };
}

// SWIFT Lookup - APILayer Bank Data API
export async function lookupSWIFTExternal(swift: string): Promise<ExternalAPIResult> {
  try {
    console.log(`[EXTERNAL_API] Looking up SWIFT with APILayer: ${swift}`);
    
    // Check cache first
    const cacheKey = `swift_${swift}`;
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      return {
        ...cachedResult,
        source: `${cachedResult.source}_CACHED`
      };
    }
    
    const apiKey = process.env.BANK_DATA_API_KEY;
    if (!apiKey) {
      console.log('[EXTERNAL_API] No APILayer API key, using fallback');
      const fallbackResult = await lookupSWIFTFallback(swift);
      setCachedData(cacheKey, fallbackResult, 30); // Cache fallback for 30 minutes
      return fallbackResult;
    }

    const apiUrl = `${process.env.BANK_DATA_API_URL || 'https://api.apilayer.com/bank_data'}/swift?swift_code=${swift}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'GrapseeShop/1.0',
        'apikey': apiKey
      },
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.name) {
        console.log(`[EXTERNAL_API] APILayer SWIFT success: ${data.name}`);
        
        const result = {
          success: true,
          data: {
            name: data.name,
            address: data.address || 'Unknown',
            city: data.city || 'Unknown',
            country: data.country || 'XX',
            bic: data.swift_code || swift,
            currency: data.currency || 'USD'
          },
          source: 'APILAYER_SWIFT_LOOKUP'
        };
        
        // Cache successful result for 4 hours (SWIFT data is very stable)
        setCachedData(cacheKey, result, 240);
        return result;
      }
    } else {
      console.log(`[EXTERNAL_API] APILayer SWIFT API error: ${response.status}`);
      const fallbackResult = await lookupSWIFTFallback(swift);
      setCachedData(cacheKey, fallbackResult, 30);
      return fallbackResult;
    }

  } catch (error) {
    console.log(`[EXTERNAL_API] APILayer SWIFT lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    const fallbackResult = await lookupSWIFTFallback(swift);
    setCachedData(`swift_${swift}`, fallbackResult, 30);
    return fallbackResult;
  }
}

// Fallback SWIFT lookup using basic validation
async function lookupSWIFTFallback(swift: string): Promise<ExternalAPIResult> {
  try {
    // Basic SWIFT format validation
    const isValidSwift = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(swift.toUpperCase());
    
    if (isValidSwift) {
      // Extract country code from SWIFT (positions 5-6)
      const countryCode = swift.substring(4, 6).toUpperCase();
      
      return {
        success: true,
        data: {
          name: 'Unknown Bank',
          address: 'Unknown Address',
          city: 'Unknown City',
          country: countryCode,
          bic: swift.toUpperCase(),
          currency: 'USD'
        },
        source: 'FALLBACK_SWIFT_VALIDATION'
      };
    } else {
      return {
        success: false,
        error: 'Invalid SWIFT format',
        source: 'FALLBACK_ERROR'
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'Fallback SWIFT lookup failed', 
      source: 'FALLBACK_ERROR' 
    };
  }
}

// IBAN Validation - APILayer Bank Data API
export async function validateIBANExternal(iban: string): Promise<ExternalAPIResult> {
  try {
    console.log(`[EXTERNAL_API] Validating IBAN with APILayer: ${iban.substring(0, 4)}****`);
    
    // Check cache first
    const cacheKey = `iban_${iban}`;
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      return {
        ...cachedResult,
        source: `${cachedResult.source}_CACHED`
      };
    }
    
    const apiKey = process.env.BANK_DATA_API_KEY;
    if (!apiKey) {
      console.log('[EXTERNAL_API] No APILayer API key, using fallback');
      const fallbackResult = await validateIBANFallback(iban);
      setCachedData(cacheKey, fallbackResult, 30); // Cache fallback for 30 minutes
      return fallbackResult;
    }

    const apiUrl = `${process.env.BANK_DATA_API_URL || 'https://api.apilayer.com/bank_data'}/iban_validate?iban_number=${iban}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'GrapseeShop/1.0',
        'apikey': apiKey
      },
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[EXTERNAL_API] APILayer IBAN result: ${data.valid ? 'Valid' : 'Invalid'}`);
      
      const result = {
        success: true,
        data: {
          valid: data.valid || false,
          bankData: data.bank_data,
          ibanData: data.iban_data,
          bic: data.bank_data?.bic,
          bankName: data.bank_data?.name,
          country: data.iban_data?.country_code,
          sepaCountry: data.iban_data?.sepa_country
        },
        source: 'APILAYER_IBAN_VALIDATION'
      };
      
      // Cache successful result for 2 hours (bank data doesn't change often)
      setCachedData(cacheKey, result, 120);
      return result;
    } else {
      console.log(`[EXTERNAL_API] APILayer IBAN API error: ${response.status}`);
      const fallbackResult = await validateIBANFallback(iban);
      setCachedData(cacheKey, fallbackResult, 30); // Cache fallback for 30 minutes
      return fallbackResult;
    }

  } catch (error) {
    console.log(`[EXTERNAL_API] APILayer IBAN validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    const fallbackResult = await validateIBANFallback(iban);
    setCachedData(`iban_${iban}`, fallbackResult, 30);
    return fallbackResult;
  }
}

// Local MOD-97 IBAN validation (FREE FOREVER - NO API)
function validateIBANLocally(iban: string): { valid: boolean; reason?: string } {
  const cleaned = iban.replace(/\s+/g, '').toUpperCase();

  // Basic format: 2 letters + 2 digits + up to 30 alphanumeric
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(cleaned)) {
    return { valid: false, reason: 'Invalid IBAN format' };
  }

  // Move first 4 chars to end
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);

  // Convert letters to numbers (A=10, B=11 ... Z=35)
  const numeric = rearranged.split('').map(ch => {
    const code = ch.charCodeAt(0);
    return code >= 65 ? (code - 55).toString() : ch;
  }).join('');

  // MOD-97 in chunks (prevents integer overflow)
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 9) {
    remainder = parseInt(remainder + numeric.slice(i, i + 9)) % 97;
  }

  return remainder === 1
    ? { valid: true }
    : { valid: false, reason: 'IBAN checksum failed' };
}

// Complete IBAN validation pipeline with correct flow order
export async function validateIBANComplete(iban: string): Promise<ExternalAPIResult> {
  try {
    console.log(`[IBAN_PIPELINE] Starting validation for: ${iban.substring(0, 4)}****`);
    
    // STEP 1: Local MOD-97 validation (FREE - no API calls)
    const localResult = validateIBANLocally(iban);
    if (!localResult.valid) {
      console.log(`[IBAN_PIPELINE] Local validation failed: ${localResult.reason}`);
      return {
        success: false,
        error: localResult.reason || 'Invalid IBAN',
        source: 'LOCAL_MOD97_VALIDATION'
      };
    }
    console.log(`[IBAN_PIPELINE] Local validation passed`);

    // STEP 2: Check cache by IBAN key
    const cacheKey = `iban_${iban}`;
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      console.log(`[IBAN_PIPELINE] Cache hit - returning cached result`);
      return {
        ...cachedResult,
        source: `${cachedResult.source}_CACHED`
      };
    }

    // STEP 3: Call APILayer API (only if local validation passed)
    const apiKey = process.env.BANK_DATA_API_KEY;
    if (!apiKey) {
      console.log(`[IBAN_PIPELINE] No APILayer API key - using fallback`);
      const fallbackResult = await createFallbackResult(iban);
      setCachedData(cacheKey, fallbackResult, 30 * 24 * 60); // 30 days
      return fallbackResult;
    }

    const apiUrl = `${process.env.BANK_DATA_API_URL || 'https://api.apilayer.com/bank_data'}/iban_validate?iban_number=${iban}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'GrapseeShop/1.0',
        'apikey': apiKey
      },
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok) {
      const data = await response.json();
      
      // Double-check APILayer valid field
      if (!data.valid) {
        console.log(`[IBAN_PIPELINE] APILayer says invalid IBAN`);
        return {
          success: false,
          error: 'IBAN failed API validation',
          source: 'APILAYER_VALIDATION'
        };
      }

      console.log(`[IBAN_PIPELINE] APILayer validation passed - bank: ${data.bank_data?.name}`);

      // STEP 4: Cross-check bank name + country against sanctions
      const bankName = data.bank_data?.name || 'Unknown Bank';
      const countryCode = data.iban_data?.country_code || iban.substring(0, 2);
      
      const sanctionResult = await checkSanctionsExternal(countryCode, bankName);
      
      const result = {
        success: true,
        data: {
          valid: true,
          bankData: data.bank_data,
          ibanData: data.iban_data,
          bic: data.bank_data?.bic,
          bankName: bankName,
          country: countryCode,
          sepaCountry: data.iban_data?.sepa_country,
          isSanctioned: sanctionResult.data?.isSanctioned || false,
          sanctionReason: sanctionResult.data?.reason
        },
        source: 'APILAYER_IBAN_VALIDATION'
      };

      // STEP 5: Save full response to cache (TTL: 30 days)
      setCachedData(cacheKey, result, 30 * 24 * 60); // 30 days in minutes
      
      // STEP 6: Return APPROVE or FLAG based on sanctions
      console.log(`[IBAN_PIPELINE] Validation complete - Sanctioned: ${result.data.isSanctioned}`);
      return result;

    } else {
      console.log(`[IBAN_PIPELINE] APILayer API error: ${response.status}`);
      const fallbackResult = await createFallbackResult(iban);
      setCachedData(cacheKey, fallbackResult, 30 * 24 * 60);
      return fallbackResult;
    }

  } catch (error) {
    console.log(`[IBAN_PIPELINE] Complete validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    const fallbackResult = await createFallbackResult(iban);
    setCachedData(`iban_${iban}`, fallbackResult, 30 * 24 * 60);
    return fallbackResult;
  }
}

// Create fallback result when API is not available
async function createFallbackResult(iban: string): Promise<ExternalAPIResult> {
  return {
    success: true,
    data: {
      valid: true,
      bankData: null,
      ibanData: null,
      bic: null,
      bankName: 'Unknown Bank',
      country: iban.substring(0, 2),
      sepaCountry: false,
      isSanctioned: false,
      sanctionReason: null
    },
    source: 'FALLBACK_IBAN_VALIDATION'
  };
}

// Fallback IBAN validation using local algorithm (kept for compatibility)
async function validateIBANFallback(iban: string): Promise<ExternalAPIResult> {
  const localResult = validateIBANLocally(iban);
  
  return {
    success: localResult.valid,
    data: {
      valid: localResult.valid,
      bankData: null,
      ibanData: null,
      bic: null,
      bankName: 'Unknown Bank',
      country: iban.substring(0, 2),
      sepaCountry: false
    },
    error: localResult.valid ? undefined : (localResult.reason || 'Invalid IBAN'),
    source: 'FALLBACK_IBAN_VALIDATION'
  };
}

// Sanction Check - Trade.gov Consolidated Screening List API
export async function checkSanctionsExternal(country: string, bankName: string): Promise<ExternalAPIResult> {
  try {
    console.log(`[EXTERNAL_API] Checking Trade.gov sanctions for: ${bankName} in ${country}`);
    
    const apiKey = process.env.TRADE_SANCTION_API_KEY;
    if (!apiKey) {
      console.log('[EXTERNAL_API] No Trade.gov API key, using fallback');
      return await checkSanctionsFallback(country, bankName);
    }

    // Trade.gov Consolidated Screening List API
    const apiUrl = `${process.env.SANCTION_API_URL || 'https://data.trade.gov/consolidated_screening_list/v1/search'}?name=${encodeURIComponent(bankName)}&countries=${country}&fuzzy_name=true`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'GrapseeShop/1.0',
        'api_key': apiKey
      },
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[EXTERNAL_API] Trade.gov sanction result: ${data.results?.length || 0} matches found`);
      
      const isSanctioned = data.results && data.results.length > 0;
      const sanctionReason = isSanctioned ? `Found ${data.results.length} sanction matches` : undefined;
      
      return {
        success: true,
        data: {
          isSanctioned,
          reason: sanctionReason,
          matches: data.results?.slice(0, 3) || [] // Return first 3 matches for logging
        },
        source: 'TRADE_GOV_SANCTION_CHECK'
      };
    } else {
      console.log(`[EXTERNAL_API] Trade.gov API error: ${response.status}`);
      return await checkSanctionsFallback(country, bankName);
    }

  } catch (error) {
    console.log(`[EXTERNAL_API] Trade.gov sanction check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return await checkSanctionsFallback(country, bankName);
  }
}

// Fallback sanction check using local lists
async function checkSanctionsFallback(country: string, bankName: string): Promise<ExternalAPIResult> {
  const sanctionCountries = ['AF', 'IR', 'KP', 'SY', 'CU', 'MM', 'BY', 'RU'];
  const sanctionBanks = [
    'BANK OF NORTH KOREA',
    'CENTRAL BANK OF IRAN',
    'SYRIAN ARAB REPUBLIC',
    'BANK MELLI IRAN',
    'BANK SADERAT IRAN'
  ];

  const isSanctioned = sanctionCountries.includes(country) || 
                       sanctionBanks.some(bank => bankName.toUpperCase().includes(bank));

  return {
    success: true,
    data: {
      isSanctioned,
      reason: isSanctioned ? 'Local sanction list fallback' : undefined
    },
    source: 'LOCAL_SANCTION_LIST'
  };
}

// Fraud Detection - FraudGuard v2 IP Reputation API
export async function checkFraudExternal(email: string, ip: string, deviceFingerprint?: string): Promise<ExternalAPIResult> {
  try {
    console.log(`[EXTERNAL_API] Checking FraudGuard IP reputation for: ${ip}`);
    
    const username = process.env.FRAUDGUARD_USERNAME;
    const password = process.env.FRAUDGUARD_PASSWORD;
    
    if (!username || !password) {
      console.log('[EXTERNAL_API] No FraudGuard credentials, using fallback');
      return await checkFraudFallback(ip);
    }

    // FraudGuard v2 IP Reputation API
    const apiUrl = `${process.env.FRAUDGUARD_API_URL || 'https://api.fraudguard.io/v2/ip'}/${ip}`;
    
    // Create Basic Auth header
    const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'GrapseeShop/1.0',
        'Authorization': authHeader
      },
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`[EXTERNAL_API] FraudGuard result: risk_level ${data.risk_level}, threat ${data.threat}`);
      
      // Map FraudGuard risk_level (1-5) to our risk score (0-100)
      const riskScore = mapFraudGuardRiskScore(data.risk_level);
      const recommendations = mapFraudGuardRecommendations(data.risk_level, data.threat);
      
      return {
        success: true,
        data: {
          riskScore,
          flags: data.threat ? [data.threat] : [],
          recommendations,
          details: {
            riskLevel: data.risk_level,
            threat: data.threat,
            country: data.country,
            isp: data.isp,
            connectionType: data.connection_type
          }
        },
        source: 'FRAUDGUARD_IP_REPUTATION'
      };
    } else {
      console.log(`[EXTERNAL_API] FraudGuard API error: ${response.status}`);
      return await checkFraudFallback(ip);
    }

  } catch (error) {
    console.log(`[EXTERNAL_API] FraudGuard check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return await checkFraudFallback(ip);
  }
}

// Map FraudGuard risk_level (1-5) to risk score (0-100)
function mapFraudGuardRiskScore(riskLevel: number): number {
  const mapping = {
    1: 10,  // Low Risk
    2: 30,  // Suspicious 
    3: 50,  // Moderate Risk
    4: 75,  // High Risk
    5: 100  // Critical Risk
  };
  return mapping[riskLevel as keyof typeof mapping] || 50;
}

// Map FraudGuard risk_level to recommendations
function mapFraudGuardRecommendations(riskLevel: number, threat: string): string[] {
  const recommendations = [];
  
  switch (riskLevel) {
    case 1:
      recommendations.push('ALLOW');
      break;
    case 2:
      recommendations.push('ALLOW_WITH_CAUTION');
      break;
    case 3:
      recommendations.push('FLAG_FOR_REVIEW');
      break;
    case 4:
      recommendations.push('MANUAL_REVIEW');
      break;
    case 5:
      recommendations.push('BLOCK');
      break;
  }
  
  // Add threat-specific recommendations
  if (threat === 'vpn_tracker') {
    recommendations.push('VPN_DETECTED');
  } else if (threat === 'anonymous_tracker') {
    recommendations.push('ANONYMOUS_PROXY');
  } else if (threat === 'botnet_tracker') {
    recommendations.push('BOTNET_IP');
  }
  
  return recommendations;
}

// Fallback fraud check using basic IP analysis
async function checkFraudFallback(ip: string): Promise<ExternalAPIResult> {
  try {
    // Basic IP validation and risk assessment
    const privateIPRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./
    ];
    
    const isPrivateIP = privateIPRanges.some(range => range.test(ip));
    const isLocalhost = ip === 'localhost' || ip === '::1';
    
    let riskScore = 20; // Base risk score
    let flags: string[] = [];
    
    if (isPrivateIP || isLocalhost) {
      riskScore = 5; // Very low risk for private/local IPs
      flags.push('PRIVATE_IP');
    } else {
      flags.push('PUBLIC_IP');
    }
    
    return {
      success: true,
      data: {
        riskScore,
        flags,
        recommendations: riskScore > 50 ? ['MANUAL_REVIEW'] : ['ALLOW']
      },
      source: 'FALLBACK_IP_ANALYSIS'
    };
    
  } catch (error) {
    return { 
      success: false, 
      error: 'Fallback fraud check failed', 
      source: 'FALLBACK_ERROR' 
    };
  }
}

// API Health Check
export async function checkAPIHealth(): Promise<{[key: string]: boolean}> {
  const results: {[key: string]: boolean} = {};
  
  // Test BIN API
  try {
    const binResult = await lookupBINExternal('411111');
    results.BIN_API = binResult.success;
  } catch (error) {
    results.BIN_API = false;
  }
  
  // Test SWIFT API
  try {
    const swiftResult = await lookupSWIFTExternal('CITIUS33');
    results.SWIFT_API = swiftResult.success;
  } catch (error) {
    results.SWIFT_API = false;
  }
  
  // Test IBAN API
  try {
    const ibanResult = await validateIBANExternal('GB82WEST12345698765432');
    results.IBAN_API = ibanResult.success;
  } catch (error) {
    results.IBAN_API = false;
  }
  
  console.log('[EXTERNAL_API] Health check results:', results);
  return results;
}
