import inquirer from 'inquirer';

export async function collectInputs() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'empresa',
      message: 'Cual es el nombre de la empresa?',
      validate: (v) => v.trim() ? true : 'El nombre de la empresa es obligatorio.',
    },
    {
      type: 'input',
      name: 'pais',
      message: 'En que pais opera principalmente?',
      default: 'Colombia',
    },
    {
      type: 'list',
      name: 'idioma',
      message: 'En que idioma debe estar el documento?',
      choices: ['Espanol', 'Ingles'],
      default: 'Espanol',
    },
    {
      type: 'list',
      name: 'enfoque',
      message: 'Hacia donde enfocar el caso de uso?',
      choices: [
        'Fuerza de ventas / equipos comerciales',
        'Operaciones y primera linea (tiendas, bodegas)',
        'Customer Success / postventa',
        'Training y onboarding',
        'Auto (el agente decide segun el perfil)',
      ],
      default: 'Auto (el agente decide segun el perfil)',
    },
    {
      type: 'input',
      name: 'infoExtra',
      message: 'Algun detalle adicional que debas saber? (opcional)',
      default: '',
    },
  ]);

  return {
    empresa: answers.empresa.trim(),
    pais: answers.pais.trim(),
    idioma: answers.idioma,
    enfoque: answers.enfoque,
    infoExtra: answers.infoExtra.trim(),
  };
}
