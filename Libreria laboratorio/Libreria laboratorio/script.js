// 1. Constructor para Libros
function Libro(id, titulo, autor, año) {
    this.id = id;
    this.titulo = titulo;
    this.autor = autor;
    this.año = año;
    this.disponible = true;

    this.prestar = function () {
        this.disponible = false;
    };

    this.devolver = function () {
        this.disponible = true;
    };
}

// 2. Constructor para Usuarios
function Usuario(id, nombre, email) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.librosPrestados = [];

    this.prestarLibro = function(prestamo) {
        this.librosPrestados.push(prestamo);
    };

    this.devolverLibro = function(prestamoId) {
        this.librosPrestados = this.librosPrestados.filter(p => p.id !== prestamoId);
    };
}

// 3. Constructor para Préstamos
function Prestamo(id, libroId, usuarioId, fechaPrestamo) {
    this.id = id;
    this.libroId = libroId;
    this.usuarioId = usuarioId;
    this.fechaPrestamo = fechaPrestamo;
    this.estado = "Prestado";
    this.fechaDevolucion = null;

    this.devolver = function () {
        this.estado = "Devuelto";
        this.fechaDevolucion = new Date().toISOString();
    };
}

// Base de datos
const biblioteca = {
    libros: [],
    usuarios: [],
    prestamos: [],
    nextLibroId: 1,
    nextUsuarioId: 1,
    nextPrestamoId: 1,

    // Métodos para agregar elementos
    
    agregarLibro: function(titulo, autor, año) {
        const libro = new Libro(this.nextLibroId++, titulo, autor, año);
        this.libros.push(libro);
        return libro;
    },

    agregarUsuario: function(nombre, email) {
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            alert("Email inválido");
            return null;
        }

        const usuario = new Usuario(this.nextUsuarioId++, nombre, email);
        this.usuarios.push(usuario);
        return usuario;
    },

    prestarLibro: function(libroId, usuarioId) {
        const libro = this.libros.find(l => l.id === libroId);
        const usuario = this.usuarios.find(u => u.id === usuarioId);

        if (!libro || !usuario) return false;
        if (!libro.disponible) {
            alert("El libro no está disponible.");
            return false;
        }

        const prestamo = new Prestamo(this.nextPrestamoId++, libroId, usuarioId, new Date().toISOString());
        libro.prestar();
        usuario.prestarLibro(prestamo);
        this.prestamos.push(prestamo);
        return true;
    },

    devolverLibro: function(prestamoId) {
        const prestamo = this.prestamos.find(p => p.id === prestamoId && p.estado === "Prestado");

        if (!prestamo) return false;

        const libro = this.libros.find(l => l.id === prestamo.libroId);
        const usuario = this.usuarios.find(u => u.id === prestamo.usuarioId);

        if (!libro || !usuario) return false;

        libro.devolver();
        usuario.devolverLibro(prestamoId);
        prestamo.devolver();

        return true;
    }
};

// Función para inicializar datos de ejemplo

function init() {
    // Agregar libros de ejemplo
    biblioteca.agregarLibro("Cien años de soledad", "Gabriel García Márquez", 1967);
    biblioteca.agregarLibro("1984", "George Orwell", 1949);
    biblioteca.agregarLibro("El Principito", "Antoine de Saint-Exupéry", 1943);
    
    // Agregar usuarios de ejemplo
    biblioteca.agregarUsuario("Ana López", "ana@email.com");
    biblioteca.agregarUsuario("Carlos Ruiz", "carlos@email.com");
    
    // Realizar algunos préstamos
    biblioteca.prestarLibro(1, 1);
    biblioteca.prestarLibro(2, 2);
    
    // Renderizar datos
    renderLibros();
    renderUsuarios();
    renderPrestamos();
}

// Funciones para renderizar las tablas (debes implementarlas)

function renderLibros() {
    const tablaLibros = document.querySelector("#tablaLibros tbody");
    tablaLibros.innerHTML = '';

    biblioteca.libros.forEach(libro => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${libro.id}</td>
            <td>${libro.titulo}</td>
            <td>${libro.autor}</td>
            <td>${libro.año}</td>
            <td>${libro.disponible ? 'Sí' : 'No'}</td>
            <td>
                <button onclick="eliminarLibro(${libro.id})">Eliminar</button>
                <button onclick="prestarLibro(${libro.id})" ${!libro.disponible ? 'disabled' : ''}>Prestar</button>
            </td>
        `;
        tablaLibros.appendChild(fila);
    });
}

function renderUsuarios() {
    const tablaUsuarios = document.querySelector("#tablaUsuarios tbody");
    tablaUsuarios.innerHTML = '';

    biblioteca.usuarios.forEach(usuario => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.email}</td>
            <td>${usuario.librosPrestados.length}</td>
            <td>
                <button onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
            </td>
        `;
        tablaUsuarios.appendChild(fila);
    });
}

function renderPrestamos() {
    const tablaPrestamos = document.querySelector("#tablaPrestamos tbody");
    tablaPrestamos.innerHTML = '';

    biblioteca.prestamos.forEach(prestamo => {
        const libro = biblioteca.libros.find(l => l.id === prestamo.libroId);
        const usuario = biblioteca.usuarios.find(u => u.id === prestamo.usuarioId);
        const fechaDevolucion = prestamo.estado === "Devuelto" ? prestamo.fechaDevolucion : 'N/A';

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${prestamo.id}</td>
            <td>${libro.titulo}</td>
            <td>${usuario.nombre}</td>
            <td>${prestamo.fechaPrestamo}</td>
            <td>${fechaDevolucion}</td>
            <td>${prestamo.estado}</td>
            <td>
                ${prestamo.estado === "Prestado" ? `<button onclick="devolverLibro(${prestamo.id})">Devolver</button>` : ''}
            </td>
        `;
        tablaPrestamos.appendChild(fila);
    });
}


// Acciones

function agregarNuevoLibro() {
    const titulo = document.getElementById("nuevoLibroTitulo").value.trim();
    const autor = document.getElementById("nuevoLibroAutor").value.trim();
    const año = parseInt(document.getElementById("nuevoLibroAño").value);

    if (!titulo || !autor || isNaN(año)) {
        alert("Todos los campos del libro son obligatorios.");
        return;
    }

    biblioteca.agregarLibro(titulo, autor, año);
    renderLibros();
    renderSelects();

    document.getElementById("nuevoLibroTitulo").value = "";
    document.getElementById("nuevoLibroAutor").value = "";
    document.getElementById("nuevoLibroAño").value = "";
}

function agregarNuevoUsuario() {
    const nombre = document.getElementById("nuevoUsuarioNombre").value.trim();
    const email = document.getElementById("nuevoUsuarioEmail").value.trim();

    if (!nombre || !email) {
        alert("Todos los campos del usuario son obligatorios.");
        return;
    }

    const nuevo = biblioteca.agregarUsuario(nombre, email);
    if (nuevo) {
        renderUsuarios();
        renderSelects();
        document.getElementById("nuevoUsuarioNombre").value = "";
        document.getElementById("nuevoUsuarioEmail").value = "";
    }
}

function realizarPrestamo() {
    const libroId = parseInt(document.getElementById("selectLibro").value);
    const usuarioId = parseInt(document.getElementById("selectUsuario").value);

    if (isNaN(libroId) || isNaN(usuarioId)) {
        alert("Debes seleccionar un libro y un usuario.");
        return;
    }

    const exito = biblioteca.prestarLibro(libroId, usuarioId);
    if (exito) {
        renderLibros();
        renderUsuarios();
        renderPrestamos();
        renderSelects();
    }
}

function devolverLibro(prestamoId) {
    const exito = biblioteca.devolverLibro(prestamoId);
    if (exito) {
        renderLibros();
        renderUsuarios();
        renderPrestamos();
        renderSelects();
    }
}

function eliminarLibro(id) {
    const enUso = biblioteca.prestamos.some(p => p.libroId === id && p.estado === "Prestado");
    if (enUso) {
        alert("Este libro está prestado y no se puede eliminar.");
        return;
    }
    biblioteca.libros = biblioteca.libros.filter(l => l.id !== id);
    renderLibros();
    renderSelects();
}

function eliminarUsuario(id) {
    const usuario = biblioteca.usuarios.find(u => u.id === id);
    if (usuario.librosPrestados.length > 0) {
        alert("Este usuario tiene libros prestados y no se puede eliminar.");
        return;
    }
    biblioteca.usuarios = biblioteca.usuarios.filter(u => u.id !== id);
    renderUsuarios();
    renderSelects();
}

// Iniciar la aplicación
window.onload = init;
