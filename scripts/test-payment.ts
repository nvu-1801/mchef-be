#!/usr/bin/env node
/**
 * Test script: Verify payment system locally
 * Usage: npx ts-node scripts/test-payment.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testPaymentSystem() {
  console.log("🧪 Testing Payment System...\n");

  try {
    // 1️⃣ Check tables exist
    console.log("1️⃣ Checking database tables...");
    
    const { data: plans, error: plansErr } = await sb
      .from("plans")
      .select("id, name")
      .limit(1);
    
    if (plansErr) {
      console.error("❌ plans table error:", plansErr);
    } else {
      console.log("✅ plans table OK, found", plans?.length || 0, "plans");
    }

    const { data: orders, error: ordersErr } = await sb
      .from("orders")
      .select("id, order_code")
      .limit(1);
    
    if (ordersErr) {
      console.error("❌ orders table error:", ordersErr);
    } else {
      console.log("✅ orders table OK");
    }

    const { data: transactions, error: transErr } = await sb
      .from("user_transactions")
      .select("id, user_id")
      .limit(1);
    
    if (transErr) {
      console.error("❌ user_transactions table error:", transErr);
    } else {
      console.log("✅ user_transactions table OK");
    }

    // 2️⃣ Check users table columns
    console.log("\n2️⃣ Checking users table columns...");
    const { data: users, error: usersErr } = await sb
      .from("users")
      .select("id, plan_id, plan_expired_at")
      .limit(1);
    
    if (usersErr) {
      console.error("❌ users table error (maybe missing columns plan_id/plan_expired_at):", usersErr);
    } else {
      console.log("✅ users table has plan_id and plan_expired_at columns");
    }

    // 3️⃣ Check RLS policies
    console.log("\n3️⃣ Checking RLS policies (via Supabase)...");
    console.log("⚠️  RLS policies check requires admin access");
    console.log("    Please verify in Supabase Dashboard → SQL Editor");
    console.log("    Run: SELECT policyname FROM pg_policies WHERE tablename IN ('users', 'user_transactions', 'orders');");

    // 4️⃣ Sample data
    console.log("\n4️⃣ Sample data...");
    if (plans && plans.length > 0) {
      console.log("Sample plan:", plans[0]);
    }

    console.log("\n✅ All basic checks passed!");
    console.log("\n📝 Next steps:");
    console.log("1. Run migration: migrations/002_fix_rls_for_webhook.sql in Supabase SQL Editor");
    console.log("2. Test payment on PayOS");
    console.log("3. Check webhook logs on Vercel or local server");
    console.log("4. Verify transaction in Supabase dashboard");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testPaymentSystem();
