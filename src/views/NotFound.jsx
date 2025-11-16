import { Link } from 'react-router-dom'

const NotFound = () => {

    return (
        <main className="container">
            <h1> Error 404 | Not Found 😥</h1>
            <Link to='/'> Ir el Inicio </Link>
        </main>
    )
}

export default NotFound