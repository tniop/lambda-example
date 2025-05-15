import { getHotelCode } from './src/get-hotel-code.mjs';
import { smartCheckInUsageStatsByMonth } from './src/smart-check-in-usage-stats-by-month.mjs';
import { smartCheckInUsageStatsByDay } from './src/smart-check-in-usage-stats-by-day.mjs';

// http status code
const OK = 200;
const BAD_REQUEST = 400;
const NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;

// 커스텀 에러 클래스
class CustomError extends Error {
  /**
   * @param {string} message - 에러 메시지
   * @param {number} statusCode - HTTP 상태 코드
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends CustomError {
  constructor(message) {
    super(message, BAD_REQUEST);
  }
}

class NotFoundError extends CustomError {
  constructor(message) {
    super(message, NOT_FOUND);
  }
}

function response(statusCode, data) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

/**
 * 필수 파라미터 검증 함수
 * @param {Object} params - 쿼리 파라미터 객체
 * @param {Array<string>} requiredParams - 필수 파라미터 목록
 * @throws {ValidationError} - 파라미터 누락시 발생
 */
function validateRequiredParams(params, requiredParams) {
  const missingParams = requiredParams.filter(key => !params[key]);
  if (missingParams.length > 0) {
    throw new ValidationError(`Missing required query parameter(s): ${missingParams.join(', ')}`);
  }
}

// API Gateway의 Lambda 프록시 통합(AWS_PROXY)과 프록시 리소스({proxy+})를 함께 사용
// /statistics/smart-check-in/{proxy+} 경로로 들어오는 모든 요청을 event.path 값에 따라 분기하여 처리
const routes = {
  // 호텔 코드 목록 조회
  '/statistics/smart-check-in/hotel/list': async (params) => getHotelCode(),

  // 스마트체크인 통계 - 월별
  '/statistics/smart-check-in/monthly': async (params) => {
    validateRequiredParams(params, ['hotelCode', 'year']);
    return smartCheckInUsageStatsByMonth(params.hotelCode, params.year);
  },

  // 스마트체크인 통계 - 일별
  '/statistics/smart-check-in/daily': async (params) => {
    validateRequiredParams(params, ['hotelCode', 'year', 'month']);
    return smartCheckInUsageStatsByDay(params.hotelCode, params.year, params.month);
  }
};

export const handler = async (event) => {
  const path = event.path || event.rawPath;
  const params = event.queryStringParameters || {};

  try {
    const routeHandler = routes[path];
    if (!routeHandler) {
      throw new NotFoundError('Not Found');
    }
    const result = await routeHandler(params);
    return response(OK, result);

  } catch (err) {
    if (err instanceof CustomError) {
      return response(err.statusCode, { message: err.message });
    }
    
    // 기타 에러 처리
    console.error('Unhandled Error:', err);
    return response(INTERNAL_SERVER_ERROR, { message: 'Internal Server Error' });
  }
};
