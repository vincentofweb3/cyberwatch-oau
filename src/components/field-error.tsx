export function FieldError({ errors, id }: { errors?: string[]; id?: string }) {
  if (!errors?.length) return null;

  return (
    <p id={id} className="field-error" role="alert">
      {errors[0]}
    </p>
  );
}
