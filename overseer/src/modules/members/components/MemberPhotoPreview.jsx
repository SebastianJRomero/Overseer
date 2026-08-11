/*
  MemberPhotoPreview — Foto del miembro AMPLIADA (vista en grande).

  Se abre al tocar la foto de la ficha cuando ya hay una foto adjunta.
  Muestra la imagen ampliada y, si hay permiso de edición, un botón extra
  "Cambiar foto" que vuelve a abrir el selector de archivos/cámara.

  Recibe:
    - controller: useModal que abre/cierra esta vista
    - foto: data URL de la foto adjunta (si está vacía no se renderiza)
    - nombre: nombre del miembro (alt de la imagen)
    - canEdit: con permiso 'Editar miembros'. Si es false se oculta el botón
      "Cambiar foto" (la vista queda de solo lectura).
    - onChangePhoto: () => void — abre el selector de archivos (solo canEdit).
*/

import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import styles from './MemberPhotoPreview.module.css';

export default function MemberPhotoPreview({ controller, foto, nombre, canEdit = true, onChangePhoto }) {
  // Sin foto no hay nada que ampliar (la ficha ni siquiera abre esta vista).
  if (!foto) return null;

  return (
    <Modal controller={controller} width={460}>
      <div className={styles.body}>
        <img className={styles.img} src={foto} alt={`Foto de ${nombre}`} />
        <div className={styles.actions}>
          {canEdit && (
            <Button variant="accent" onClick={onChangePhoto}>
              ↻ Cambiar foto
            </Button>
          )}
          <Button variant="outline" onClick={() => controller.close()}>Cerrar</Button>
        </div>
      </div>
    </Modal>
  );
}
