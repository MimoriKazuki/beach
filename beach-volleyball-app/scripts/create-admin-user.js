// Supabase Admin APIを使用してユーザーを作成するスクリプト
// 使用方法: node scripts/create-admin-user.js

const { createClient } = require('@supabase/supabase-js')

// 環境変数から設定を読み込み
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://awvdmlabtsfbermpjbvl.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // サービスロールキーが必要

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  console.log('Please set it in your .env.local file or as an environment variable')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    // ユーザーを作成
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: 'mimori@landbridge.co.jp',
      password: 'LB@123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Super Admin'
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return
    }

    console.log('User created successfully:', user)

    // プロフィールをadminに更新
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return
    }

    console.log('Admin role assigned successfully')
    console.log('You can now login with:')
    console.log('Email: mimori@landbridge.co.jp')
    console.log('Password: LB@123456')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdminUser()