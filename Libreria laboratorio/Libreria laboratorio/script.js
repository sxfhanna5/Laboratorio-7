// 1. Constructor para Libros
function Libro(id, titulo, autor, año) {
    this.id = id;
    this.titulo = titulo;
    this.autor = autor;
    this.año = año;
    this.disponible = true;

    this.prestar = function() {
        this.disponible = false;
    }

    this.devolver = function() {
        this.disponible = true;
    }
}

// 2. Constructor para Usuarios
function Usuario(id, nombre, email) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.librosPrestados = [];

    this.prestarLibro = function(libro) {
        this.librosPrestados.push(libro);
    };

    this.devolverLibro = function(libro) {
        this.librosPrestados = this.librosPrestados.filter(l => l.id !== libro.id);
    };
}

// 3. Constructor para Préstamos
function Prestamo(id, libroId, usuarioId, fechaPrestamo) {
    this.id = id;
    this.libroId = libroId;
    this.usuarioId = usuarioId;
    this.fechaPrestamo = fechaPrestamo;
    this.fechaDevolucion = null;
    this.estado = "Prestado";

    this.devolver = function() {
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

    agregarLibro: function(titulo, autor, año) {
        if (!titulo.trim() || !autor.trim() || isNaN(parseInt(año))) {
            alert("Todos los campos del libro son obligatorios y el año debe ser un número.");
            return null;
        }
    
        const libro = new Libro(this.nextLibroId++, titulo.trim(), autor.trim(), parseInt(año));
        this.libros.push(libro);
        return libro;
    },

    agregarUsuario: function(nombre, email) {
        if (!nombre || !email) {
            alert("Nombre y email son obligatorios.");
            return null;
        }
        const usuario = new Usuario(this.nextUsuarioId++, nombre, email);
        this.usuarios.push(usuario);
        return usuario;
    },

    prestarLibro: function(libroId, usuarioId) {
        const libro = this.libros.find(l => l.id === libroId);
        const usuario = this.usuarios.find(u => u.id === usuarioId);

        if (libro && libro.disponible && usuario) {
            libro.prestar();
            usuario.prestarLibro(libro);

            const prestamo = new Prestamo(
                this.nextPrestamoId++,
                libroId,
                usuarioId,
                new Date().toISOString()
            );

            this.prestamos.push(prestamo);
            return prestamo;
        }

        return null;
    },

    devolverLibro: function(prestamoId) {
        const prestamo = this.prestamos.find(p => p.id === prestamoId && p.estado === "Prestado");
        if (prestamo) {
            const libro = this.libros.find(l => l.id === prestamo.libroId);
            const usuario = this.usuarios.find(u => u.id === prestamo.usuarioId);

            libro.devolver();
            usuario.devolverLibro(libro);
            prestamo.devolver();
            return true;
        }
        return false;
    }
};

// Inicializar datos
function init() {
    biblioteca.agregarLibro("Cien años de soledad", "Gabriel García Márquez", 1967);
    biblioteca.agregarLibro("1984", "George Orwell", 1949);
    biblioteca.agregarLibro("El Principito", "Antoine de Saint-Exupéry", 1943);

    biblioteca.agregarUsuario("Ana López", "ana@email.com");
    biblioteca.agregarUsuario("Carlos Ruiz", "carlos@email.com");

    biblioteca.prestarLibro(1, 1);
    biblioteca.prestarLibro(2, 2);

    renderLibros();
    renderUsuarios();
    renderPrestamos();
}

// Renderizado de tablas
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

        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${prestamo.id}</td>
            <td>${libro.titulo}</td>
            <td>${usuario.nombre}</td>
            <td>${prestamo.fechaPrestamo}</td>
            <td>${prestamo.fechaDevolucion || 'N/A'}</td>
            <td>${prestamo.estado}</td>
            <td>
                ${prestamo.estado === "Prestado"
                    ? `<button onclick="devolverLibro(${prestamo.id})">Devolver</button>`
                    : ''}
            </td>
        `;
        tablaPrestamos.appendChild(fila);
    });
}

// Funciones auxiliares
function eliminarLibro(libroId) {
    const estaPrestado = biblioteca.prestamos.some(p => p.libroId === libroId && p.estado === "Prestado");
    if (estaPrestado) {
        alert("No puedes eliminar un libro que está prestado.");
        return;
    }
    biblioteca.libros = biblioteca.libros.filter(libro => libro.id !== libroId);
    renderLibros();
}

function eliminarUsuario(id) {
    const tienePrestamos = biblioteca.prestamos.some(p => p.usuarioId === id && p.estado === "Prestado");
    if (tienePrestamos) {
        alert("Este usuario no puede ser eliminado porque tiene libros prestados.");
        return;
    }
    biblioteca.usuarios = biblioteca.usuarios.filter(u => u.id !== id);
    renderUsuarios();
}

function devolverLibro(prestamoId) {
    const exito = biblioteca.devolverLibro(prestamoId);
    if (exito) {
        renderLibros();
        renderUsuarios();
        renderPrestamos();
    } else {
        alert("No se pudo devolver el libro.");
    }
}

function esEmailValido(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function agregarNuevoUsuario() {
    const nombre = document.getElementById("nuevoUsuarioNombre").value;
    const email = document.getElementById("nuevoUsuarioEmail").value;

    if (!esEmailValido(email)) {
        alert("Email inválido");
        return;
    }

    biblioteca.agregarUsuario(nombre, email);
    renderUsuarios();
}

function agregarNuevoLibro() {
    const titulo = document.getElementById("nuevoLibroTitulo").value;
    const autor = document.getElementById("nuevoLibroAutor").value;
    const año = document.getElementById("nuevoLibroAño").value;

    const libro = biblioteca.agregarLibro(titulo, autor, año);
    if (libro) {
        renderLibros();

        // Limpiar campos
        document.getElementById("nuevoLibroTitulo").value = "";
        document.getElementById("nuevoLibroAutor").value = "";
        document.getElementById("nuevoLibroAño").value = "";
    }
}

window.onload = init;