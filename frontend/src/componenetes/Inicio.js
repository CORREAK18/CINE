import React from "react";
import "./css/inicio.css";

const Inicio = () => {
  return (
    <section className="history">
      <h1>Bienvenidos </h1>
      <img 
        src="https://scontent.fpiu4-1.fna.fbcdn.net/v/t39.30808-6/292140114_720604898903108_8681938345966556236_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=dU6hW4sZPBUQ7kNvwGrUsFs&_nc_oc=AdmihEMeSfArJHZMKXy_hiHAY3fjAReZP93upmB7IB3PsYataA7S4xTHTALJtXeN8qE&_nc_zt=23&_nc_ht=scontent.fpiu4-1.fna&_nc_gid=RHA_AuJvE5mLNSmbj-f95w&oh=00_AfRk3fX9prD5XmgSAMyAiOUt8QAPL2QqIuOvNYSZn-5zkQ&oe=6887A5D0"
        alt="Catálogo de películas" 
        className="history-image"
      />
      <p>
        Desde nuestra fundación en <strong>1990</strong>, hemos trabajado con pasión y dedicación para traerte
        la mejor selección de películas del mundo. Nuestro compromiso con la calidad cinematográfica y la 
        experiencia del usuario nos ha permitido crecer y consolidarnos como la plataforma líder en 
        entretenimiento digital.
      </p>
      <p>
        Hoy, seguimos con la misma visión: **crear experiencias cinematográficas inolvidables** con el 
        catálogo más completo y las mejores recomendaciones personalizadas para cada usuario.
      </p>
    </section>
  );
};

export default Inicio;