# 📧 Configuración de Email para Newsletter

## 🎯 Resumen
Para que funcione el envío de correos del newsletter, necesitas configurar una **Contraseña de Aplicación de Gmail**.

## ✅ Estado Actual
- ✅ Backend configurado con Nodemailer
- ✅ Controlador de newsletter listo (`newsletter.controller.ts`)
- ✅ Servicio de email implementado (`email.service.ts`)  
- ✅ Ruta pública `/api/newsletter/subscribe` funcionando
- ✅ Frontend con componente Newsletter en el Footer
- ⚠️ **FALTA**: Configurar credenciales de email en `.env`

---

## 📋 Paso 1: Obtener Contraseña de Aplicación de Gmail

### Opción A: Si tienes cuenta de Gmail personal

1. **Ir a tu cuenta de Google**
   - Visita: https://myaccount.google.com/security

2. **Activar verificación en 2 pasos** (si no está activada)
   - En "Cómo inicias sesión en Google"
   - Click en "Verificación en dos pasos"
   - Sigue los pasos para activarla

3. **Crear Contraseña de Aplicación**
   - Vuelve a https://myaccount.google.com/security
   - Busca "Contraseñas de aplicaciones" (solo aparece si tienes 2FA activado)
   - Click en "Contraseñas de aplicaciones"
   - Selecciona "Correo" y "Otro (nombre personalizado)"
   - Escribe "BookCode Newsletter"
   - Click en "Generar"
   - **COPIA LA CONTRASEÑA** que aparece (16 caracteres sin espacios)

### Opción B: Usar otro servicio de email

Si prefieres no usar Gmail, puedes configurar:
- **Outlook/Hotmail**: Similar a Gmail
- **SendGrid**: Servicio profesional gratuito (100 emails/día)
- **Mailgun**: Servicio profesional
- **AWS SES**: Amazon Simple Email Service

---

## 📝 Paso 2: Editar el archivo `.env`

Abre el archivo `Backend/.env` y configura estas variables:

```bash
# Email Configuration (Gmail)
EMAIL_USER=tu-email@gmail.com
EMAIL_APP_PASSWORD=abcd efgh ijkl mnop  # La contraseña de 16 dígitos que copiaste

# Frontend URL (ya debería estar configurada)
FRONTEND_URL=http://localhost:5173
```

**Ejemplo real:**
```bash
EMAIL_USER=bookcode@gmail.com
EMAIL_APP_PASSWORD=xyzw abcd efgh ijkl
```

⚠️ **IMPORTANTE**: 
- NO uses tu contraseña normal de Gmail
- Usa SOLO la Contraseña de Aplicación generada
- Los espacios en la contraseña no importan (Nodemailer los ignora)

---

## 🧪 Paso 3: Probar el Newsletter

### 1. Reiniciar el Backend

```bash
cd Backend
npm run build
node dist/index.js
```

### 2. Probar desde el Frontend

1. Abre tu navegador en `http://localhost:5173`
2. Baja hasta el **Footer** de la página
3. Busca la sección "📚 Únete a Nuestra Comunidad"
4. Ingresa tu email (y opcionalmente tu nombre)
5. Click en "Suscribirme"

### 3. Verificar el funcionamiento

**Si funciona correctamente:**
- ✅ Verás un mensaje de éxito con un icono verde
- ✅ Recibirás un email de bienvenida en tu bandeja de entrada
- ✅ En la consola del backend verás: `Email enviado: <messageId>`

**Si hay un error:**
- ❌ Verás un mensaje de error
- ❌ En la consola del backend verás: `Error al enviar email:`

---

## 🐛 Solución de Problemas

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Causa**: Contraseña incorrecta o no estás usando la Contraseña de Aplicación

**Solución**:
1. Verifica que la contraseña en `.env` sea la Contraseña de Aplicación (16 caracteres)
2. Asegúrate de tener activada la verificación en 2 pasos
3. Genera una nueva Contraseña de Aplicación si es necesario

### Error: "Connection timeout"

**Causa**: Gmail puede estar bloqueando la conexión

**Solución**:
1. Verifica tu conexión a internet
2. Intenta desde otra red (a veces las redes corporativas bloquean SMTP)
3. Verifica que el puerto 587 esté abierto

### Error: "self signed certificate"

**Causa**: Problema con certificados SSL

**Solución temporal** (solo para desarrollo):
```typescript
// En Backend/src/services/email.service.ts
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Solo para desarrollo
  }
});
```

### El email no llega

**Posibles causas**:
1. El email fue a la carpeta de SPAM
2. La dirección de email es inválida
3. Gmail tiene un límite de emails por día (500 para cuentas gratuitas)

**Solución**:
- Revisa tu carpeta de SPAM
- Usa un email válido
- Si necesitas enviar muchos emails, considera usar SendGrid o Mailgun

---

## 📊 Verificar Suscripciones en la Base de Datos

```sql
-- Ver todas las suscripciones
SELECT * FROM newsletter;

-- Ver solo las activas
SELECT * FROM newsletter WHERE activo = 1;

-- Contar suscriptores
SELECT COUNT(*) as total FROM newsletter WHERE activo = 1;
```

---

## 🎨 Personalización del Email

El email de bienvenida se puede personalizar en:
`Backend/src/services/email.service.ts`

Función: `sendNewsletterWelcome()`

Puedes cambiar:
- El diseño HTML
- Los colores
- El texto
- El logo
- Los enlaces

---

## 🚀 Próximos Pasos

Una vez que funcione el newsletter, puedes:

1. **Crear emails adicionales**:
   - Email de recuperación de contraseña (ya implementado)
   - Email de bienvenida para nuevos usuarios
   - Email de notificaciones

2. **Agregar más funcionalidad**:
   - Panel de administrador para ver suscriptores
   - Enviar newsletters masivos
   - Segmentación de suscriptores
   - Estadísticas de aperturas

3. **Mejorar el diseño**:
   - Templates más profesionales
   - Imágenes personalizadas
   - Botones call-to-action

---

## ✅ Checklist Final

- [ ] Verificación en 2 pasos activada en Gmail
- [ ] Contraseña de Aplicación generada
- [ ] Variables EMAIL_USER y EMAIL_APP_PASSWORD configuradas en `.env`
- [ ] Backend reiniciado
- [ ] Prueba desde el frontend exitosa
- [ ] Email de bienvenida recibido

---

## 📞 Ayuda Adicional

Si sigues teniendo problemas:

1. Verifica que todas las dependencias estén instaladas:
   ```bash
   cd Backend
   npm install
   ```

2. Revisa los logs del backend para ver errores específicos

3. Prueba con otro servicio de email temporal para confirmar que el código funciona

4. Consulta la documentación oficial:
   - Nodemailer: https://nodemailer.com/
   - Gmail SMTP: https://support.google.com/mail/answer/7126229

---

**¡Listo! Una vez configurado, tu newsletter estará funcionando perfectamente.** 🎉
