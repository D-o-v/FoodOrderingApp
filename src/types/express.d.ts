// Extend the Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        userType: string;
      };
    }
  }
}


// import { Request } from 'express';

// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         userId: string;
//         userType: string;
//       };
//     }
//   }
// }


// import { Request } from 'express';

// export interface UserPayload {
//   userId: string;
//   userType: string;
// }

// declare global {
//   namespace Express {
//     interface Request {
//       user?: UserPayload;
//     }
//   }
// }

