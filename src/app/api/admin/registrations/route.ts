import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface PendingRegistration {
  id: string;
  full_name: string;
  username: string;
  phone_number: string;
  email: string;
  password?: string;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  verified_at?: string | null;
  verified_by?: string | null;
  notes?: string;
}

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'pending-registrations.json');

function readRegistrations(): PendingRegistration[] {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading pending-registrations.json:', err);
    return [];
  }
}

function writeRegistrations(data: PendingRegistration[]) {
  try {
    const dir = path.dirname(DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing pending-registrations.json:', err);
  }
}

export async function GET(req: NextRequest) {
  const registrations = readRegistrations();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const checkUsername = searchParams.get('username');

  let filtered = [...registrations];

  if (checkUsername) {
    const found = registrations.find(
      (r) => r.username.toLowerCase() === checkUsername.toLowerCase()
    );
    return NextResponse.json({ ok: true, registration: found || null });
  }

  if (status && status !== 'all') {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.username.toLowerCase().includes(q) ||
        r.phone_number.includes(q) ||
        r.email.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ ok: true, registrations: filtered, total: registrations.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, username, phone_number, email, password } = body;

    if (!full_name || !username || !phone_number) {
      return NextResponse.json(
        { ok: false, error: 'Nama Lengkap, Username, dan Nomor WhatsApp wajib diisi' },
        { status: 400 }
      );
    }

    const registrations = readRegistrations();

    // Check if username already exists
    const existing = registrations.find(
      (r) => r.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existing) {
      if (existing.status === 'verified') {
        return NextResponse.json(
          { ok: false, error: 'Username sudah terdaftar dan terverifikasi. Silakan langsung login.' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        ok: true,
        alreadyPending: true,
        registration: existing,
        message: 'Akun Anda sudah terdaftar dan sedang menunggu verifikasi admin.',
      });
    }

    const newReg: PendingRegistration = {
      id: `reg-${Date.now()}`,
      full_name: full_name.trim(),
      username: username.trim(),
      phone_number: phone_number.trim(),
      email: email ? email.trim() : `${username.trim().toLowerCase()}@tatadana.id`,
      password: password || 'default123',
      status: 'pending',
      created_at: new Date().toISOString(),
      verified_at: null,
      verified_by: null,
      notes: 'Pendaftar baru — menunggu konfirmasi WhatsApp ke admin',
    };

    registrations.unshift(newReg);
    writeRegistrations(registrations);

    return NextResponse.json({
      ok: true,
      registration: newReg,
      message: 'Pendaftaran berhasil disimpan! Silakan hubungi WA Admin untuk verifikasi.',
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, notes, adminName } = body;

    if (!id || !action) {
      return NextResponse.json(
        { ok: false, error: 'ID dan Action (verify/reject) wajib disertakan' },
        { status: 400 }
      );
    }

    const registrations = readRegistrations();
    const idx = registrations.findIndex((r) => r.id === id);

    if (idx === -1) {
      return NextResponse.json({ ok: false, error: 'Pendaftar tidak ditemukan' }, { status: 404 });
    }

    if (action === 'verify') {
      registrations[idx].status = 'verified';
      registrations[idx].verified_at = new Date().toISOString();
      registrations[idx].verified_by = adminName || 'Super Admin';
      if (notes) registrations[idx].notes = notes;
    } else if (action === 'reject') {
      registrations[idx].status = 'rejected';
      registrations[idx].verified_at = new Date().toISOString();
      registrations[idx].verified_by = adminName || 'Super Admin';
      if (notes) registrations[idx].notes = notes;
    }

    writeRegistrations(registrations);

    return NextResponse.json({
      ok: true,
      registration: registrations[idx],
      message: `Status pendaftar berhasil diperbarui menjadi ${registrations[idx].status}`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
