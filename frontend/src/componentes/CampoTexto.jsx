// Campo do formulário com rótulo e a mensagem de erro embaixo.
// Aceita as="textarea" ou as="select" para reaproveitar o mesmo visual.

export default function CampoTexto({
  id,
  rotulo,
  obrigatorio = false,
  erro,
  as = 'input',
  largo = false,
  children,
  ...resto
}) {
  const Elemento = as;

  return (
    <div className={`campo ${largo ? 'campo--largo' : ''}`}>
      <label className="campo__rotulo" htmlFor={id}>
        {rotulo}
        {obrigatorio && <span className="campo__obrigatorio"> *</span>}
      </label>

      <Elemento
        id={id}
        className={`campo__controle ${erro ? 'campo__controle--invalido' : ''}`}
        {...resto}
      >
        {children}
      </Elemento>

      {erro && <span className="campo__erro">{erro}</span>}
    </div>
  );
}
