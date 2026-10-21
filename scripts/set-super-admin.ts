/**
 * StreamBox Colombia - Script de Asignación de Custom Claims
 * 
 * Asigna el rol inmutable { role: "SUPER_ADMIN" } al usuario principal:
 * d.s.gal.mor.9@gmail.com
 * 
 * Uso:
 * npm run set-admin
 * o bien:
 * npx tsx scripts/set-super-admin.ts
 */

import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

const TARGET_ADMIN_EMAIL = 'd.s.gal.mor.9@gmail.com';
const TARGET_ROLE = 'SUPER_ADMIN';

async function setSuperAdminClaim() {
  console.log(`\n======================================================`);
  console.log(`🔒 STREAMBOX COLOMBIA - ASIGNACIÓN DE CUSTOM CLAIMS`);
  console.log(`👤 Usuario objetivo: ${TARGET_ADMIN_EMAIL}`);
  console.log(`🛡️ Rol a conceder: ${TARGET_ROLE}`);
  console.log(`======================================================\n`);

  let app;
  if (getApps().length > 0) {
    app = getApp();
  } else {
    // Buscar credenciales de Service Account si existen
    const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      app = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log(`✅ Inicializado con serviceAccountKey.json`);
    } else if (process.env.FIREBASE_CONFIG || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      app = initializeApp();
      console.log(`✅ Inicializado con credenciales de entorno Google Cloud`);
    } else {
      // Si no hay archivo de service account en local, inicializamos con projectId del config
      const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
      let projectId = 'streambox-colombia';
      if (fs.existsSync(configPath)) {
        const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        projectId = cfg.projectId || projectId;
      }

      console.log(`ℹ️ Inicializando Firebase Admin para el proyecto: "${projectId}"`);
      app = initializeApp({
        projectId,
      });
    }
  }

  const auth = getAuth(app);

  try {
    console.log(`🔍 Buscando usuario registrado en Firebase Auth con email: ${TARGET_ADMIN_EMAIL}...`);
    const user = await auth.getUserByEmail(TARGET_ADMIN_EMAIL);

    console.log(`✅ Usuario encontrado con UID: ${user.uid}`);
    console.log(`📧 Email verificado: ${user.emailVerified ? 'SÍ' : 'NO'}`);

    console.log(`⚙️ Asignando Custom Claim { role: "${TARGET_ROLE}" }...`);
    await auth.setCustomUserClaims(user.uid, {
      role: TARGET_ROLE,
    });

    console.log(`\n🎉 ¡ÉXITO! Custom Claims asignados correctamente.`);
    console.log(`Token Claims actuales del usuario:`);
    const updatedUser = await auth.getUser(user.uid);
    console.log(JSON.stringify(updatedUser.customClaims, null, 2));

    console.log(`\n📌 IMPORTANTE:`);
    console.log(`1. Si el usuario ya tenía una sesión abierta en el navegador, debe cerrar sesión`);
    console.log(`   e iniciarla de nuevo, o esperar a que el token se refresque automáticamente.`);
    console.log(`2. La aplicación StreamBox validará este Custom Claim mediante:`);
    console.log(`   const tokenResult = await user.getIdTokenResult(true);`);
    console.log(`   tokenResult.claims.role === 'SUPER_ADMIN'`);
    console.log(`======================================================\n`);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ ERROR: El usuario "${TARGET_ADMIN_EMAIL}" NO existe aún en Firebase Authentication.`);
      console.error(`Por favor, créalo primero desde Firebase Console:`);
      console.error(`1. Ve a Firebase Console -> Authentication -> Users -> Add user`);
      console.error(`2. Ingresa el correo: ${TARGET_ADMIN_EMAIL} y asigna una contraseña segura.`);
      console.error(`3. Vuelve a ejecutar este script: npm run set-admin\n`);
    } else {
      console.error(`\n❌ Error asignando Custom Claims:`, error.message || error);
    }
    process.exit(1);
  }
}

setSuperAdminClaim().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
