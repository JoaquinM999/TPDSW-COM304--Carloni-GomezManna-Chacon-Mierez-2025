import express from 'express';
import 'dotenv/config';
import googleBooksRoutes from './routes/googleBooks.routes';
import { authRoutes } from './routes/auth.routes';
import { usuarioRoutes } from './routes/usuario.routes';
import { favoritosRoutes } from './routes/favoritos.routes';
import { listaRoutes } from './routes/lista.routes';
import { sagaRoutes } from './routes/saga.routes';
import { categoriaRoutes } from './routes/categoria.routes';
import { autorRoutes } from './routes/autor.routes';
import { libroRoutes } from './routes/libro.routes';
import { resenaRoutes } from './routes/resena.routes';
import { contenidoListaRoutes } from './routes/contenidoLista.routes';
import { reaccionRoutes } from './routes/reaccion.routes';
import { seguimientoRoutes } from './routes/seguimiento.routes';
import { recomendacionRoutes } from './routes/recomendacion.routes';
import { protectedRoutes } from './routes/protected.route';
import { authenticateJWT } from './middleware/auth.middleware';

const app = express(); 
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes); 
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/lista', listaRoutes);
app.use('/api/saga', sagaRoutes);
app.use('/api/categoria', categoriaRoutes);
app.use('/api/autor', autorRoutes);
app.use('/api/libro', libroRoutes);
app.use('/api/resena', resenaRoutes);
app.use('/api/contenido-lista', contenidoListaRoutes);
app.use('/api/reacciones', reaccionRoutes);
app.use('/api/seguimientos', seguimientoRoutes);
app.use('/api/recomendaciones', recomendacionRoutes);
app.get('/api/protected', authenticateJWT, protectedRoutes);
app.use('/api/google-books', googleBooksRoutes);


export default app;
