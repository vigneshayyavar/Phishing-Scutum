// ========================================
// 1. IMPORT MODELS
// ========================================

import User from '../models/User.js';
import Scan from '../models/Scan.js';
import Report from '../models/Report.js';


// ========================================
// 2. IN-MEMORY STORAGE
// Used when MongoDB is unavailable
// ========================================

let memoryUsers = [];
let memoryScans = [];
let memoryReports = [];


// ========================================
// 3. CHECK DATABASE CONNECTION
// ========================================

export function useMongo() {
  return User.db?.readyState === 1;
}


// ========================================
// 4. USER MANAGEMENT
// ========================================

// Find a user by email
export async function findUser(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (useMongo()) {
    return User.findOne({ email: normalizedEmail })
      .select('+passwordHash');
  }

  return memoryUsers.find(
    (user) => user.email?.toLowerCase() === normalizedEmail
  ) || null;
}


// Save a new user
export async function saveUser(data) {
  if (useMongo()) {
    return User.create({
      ...data,
      email: data.email.trim().toLowerCase(),
    });
  }

  throw new Error(
    'MongoDB is not connected. User registration cannot be persisted.'
  );
}


// Find a user by ID
export async function getUser(id) {
  if (useMongo()) {
    return User.findById(id);
  }

  return memoryUsers.find(
    user => user._id === id
  ) || null;
}


// ========================================
// 5. SCAN MANAGEMENT
// ========================================

// Save one scan
export async function saveScan(data) {
  if (useMongo()) {
    return Scan.create(data);
  }

  const scan = {
    ...data,
    _id: crypto.randomUUID(),
    createdAt: new Date(),
  };

  memoryScans.unshift(scan);
  return scan;
}


// Save multiple scans
export async function saveScansBulk(data) {
  if (data.length === 0) {
    return 0;
  }

  if (useMongo()) {
    const documents = await Scan.insertMany(
      data,
      { ordered: false }
    );

    return documents.length;
  }

  const now = new Date();

  const rows = data.map((item, index) => ({
    ...item,
    _id: crypto.randomUUID(),
    createdAt: new Date(now.getTime() + index),
  }));

  memoryScans = [
    ...rows.reverse(),
    ...memoryScans,
  ];

  return rows.length;
}


// Get scans for one user
export async function getScans(userId) {
  if (useMongo()) {
    return Scan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(500);
  }

  return memoryScans
    .filter(scan => scan.userId === userId)
    .slice(0, 500);
}


// Get one scan belonging to a user
export async function getScan(id, userId) {
  if (useMongo()) {
    return Scan.findOne({
      _id: id,
      userId,
    });
  }

  return memoryScans.find(
    scan =>
      scan._id === id &&
      scan.userId === userId
  ) || null;
}


// Delete a user's scan
export async function deleteScan(id, userId) {
  if (useMongo()) {
    return Scan.deleteOne({
      _id: id,
      userId,
    });
  }

  const previousLength = memoryScans.length;

  memoryScans = memoryScans.filter(
    scan =>
      !(scan._id === id && scan.userId === userId)
  );

  return {
    deletedCount:
      previousLength - memoryScans.length,
  };
}


// ========================================
// 6. REPORT MANAGEMENT
// ========================================

// Save a report
export async function saveReport(data) {
  if (useMongo()) {
    return Report.create(data);
  }

  const report = {
    ...data,
    _id: crypto.randomUUID(),
    createdAt: new Date(),
  };

  memoryReports.unshift(report);
  return report;
}


// Get reports for a user
export async function getReports(userId) {
  if (useMongo()) {
    return Report.find({ userId })
      .sort({ createdAt: -1 })
      .limit(500);
  }

  return memoryReports.filter(
    report => report.userId === userId
  );
}


// ========================================
// 7. DASHBOARD METRICS
// ========================================

export async function metrics() {
  if (useMongo()) {
    const [
      users,
      scans,
      reports,
      highRisk,
    ] = await Promise.all([
      User.countDocuments(),
      Scan.countDocuments(),
      Report.countDocuments(),
      Scan.countDocuments({
        riskScore: { $gte: 60 },
      }),
    ]);

    return {
      users,
      scans,
      reports,
      highRisk,
    };
  }

  return {
    users: memoryUsers.length,
    scans: memoryScans.length,
    reports: memoryReports.length,
    highRisk: memoryScans.filter(
      scan => scan.riskScore >= 60
    ).length,
  };
}


// ========================================
// 8. ADMIN SCAN ACCESS
// ========================================

export async function allScans() {
  if (useMongo()) {
    return Scan.find().limit(5000);
  }

  return memoryScans.slice(0, 5000);
}