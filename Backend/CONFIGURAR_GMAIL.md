# 📧 Configuración de Gmail para Nodemailer - BookCode

## ⚠️ IMPORTANTE: Suscripción guardada exitosamente ✅

**Buenas noticias:** Tu suscripción al newsletter se guardó correctamente en la base de datos.  
**Pendiente:** Configurar las credenciales de Gmail para que los emails se envíen.

---

## 🔧 Pasos para Configurar Gmail

### Paso 1: Activar Verificación en 2 Pasos

1. Ve a tu cuenta de Google: https://myaccount.google.com/security
2. En la sección "Cómo inicias sesión en Google", haz clic en "Verificación en dos pasos"
3. Sigue los pasos para activarla (necesitarás tu teléfono)

### Paso 2: Generar Contraseña de Aplicación

1. Ve a: https://myaccount.google.com/apppasswords
2. En "Selecciona la app", elige **"Correo"**
3. En "Selecciona el dispositivo", elige **"Otro (nombre personalizado)"**
4. Escribe: "BookCode Backend"
5. Haz clic en **"Generar"**
6. **¡IMPORTANTE!** Copia la contraseña de 16 dígitos que aparece (algo como: `xxxx xxxx xxxx xxxx`)

### Paso 3: Configurar el archivo `.env`

1. Abre el archivo `/Backend/.env` (o crea uno si no existe)
2. Agrega estas líneas:

```env
# Configuración de Email (Gmail)
EMAIL_USER=tu-email@gmail.com
EMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx

# URL del Frontend
FRONTEND_URL=http://localhost:5173
```

3. Reemplaza:
   - `tu-email@gmail.com` → Tu email de Gmail real
   - `xxxxxxxxxxxxxxxx` → La contraseña de aplicación de 16 dígitos (sin espacios)

### Ejemplo Real:

```env
EMAIL_USER=gomezmannajoaquina@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

---

## 🧪 Probar el Sistema

### 1. Reinicia el Backend

```bash
cd Backend
npm run dev
```

### 2. Prueba la Newsletter

- Ve al Footer de la página
- Ingresa tu email
- Deberías recibir un email de bienvenida 📬

### 3. Verifica en la Consola

Deberías ver algo como:

```
✅ Email enviado exitosamente a: tu@email.com
```

En lugar de:

```
❌ Error al enviar email: Missing credentials for "PLAIN"
```

---

## 🎯 Funcionalidades que usan Email

Una vez configurado, funcionarán:

1. **Newsletter** - Email de bienvenida al suscribirse
2. **Recuperación de Contraseña** - Email con token de reseteo
3. **Notificaciones** - Actividades de usuarios que sigues

---

## ❓ Troubleshooting

### ¿No recibes el email de verificación en 2 pasos?

- Revisa tu carpeta de spam
- Usa SMS en lugar de email para verificación

### ¿Error "Invalid login"?

- Verifica que la contraseña sea de **aplicación**, no tu contraseña normal de Gmail
- Quita los espacios de la contraseña de aplicación

### ¿Error "Less secure app"?

- No uses la contraseña normal de Gmail
- **DEBES** usar una contraseña de aplicación generada en el Paso 2

---

## 🔐 Seguridad

⚠️ **NUNCA** compartas tu contraseña de aplicación ni la subas a Git

✅ El archivo `.env` está en `.gitignore` (no se sube a Git)
✅ Usa contraseñas de aplicación, no tu contraseña real
✅ Puedes revocar la contraseña de aplicación en cualquier momento desde Google

---

## 📝 Estado Actual

✅ **Implementado:**
- Servicio de email (`email.service.ts`)
- Entidades (Newsletter, PasswordResetToken)
- Controladores y rutas
- Formulario en Frontend
- Migración ejecutada

⏳ **Pendiente:**
- Configurar credenciales de Gmail (este documento)

---

## 🚀 Próximos Pasos

1. ✅ Seguir los pasos 1-3 de este documento
2. ✅ Reiniciar el backend
3. ✅ Probar la suscripción a la newsletter
4. ✅ ¡Disfrutar de emails funcionando!

---

**¿Necesitas ayuda?** El sistema ya está 100% implementado, solo falta la configuración de Gmail (5 minutos).
