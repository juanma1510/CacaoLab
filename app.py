from flask_cors import CORS
import os
import base64
import io
from flask import Flask, render_template, request, send_file, jsonify
import numpy as np
from collections import Counter
import matplotlib.pyplot as plt
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from io import BytesIO
import matplotlib
from math import pi
import threading
import time
matplotlib.use('Agg')


app = Flask(__name__)
CORS(app)

#------ GRAFICOS DE BARRAS VARIABLES FISICOQUIMICAS ------

def calcular_estadisticas(valores):
    # Convertir None a 0
    valores = [0 if v is None else v for v in valores]

    if len(valores) == 0:
        return None, None, None, None
    media = round(np.mean(valores), 2)
    mediana = np.median(valores)
    moda = Counter(valores).most_common(1)[0][0]
    desviacion_estandar = round(np.std(valores), 2)
    return media, mediana, moda, desviacion_estandar

def crear_grafico_barras(seccion, parametro, valores, etiquetas=None, bar_width=0.4):
    """Crea un gráfico de barras para las estadísticas calculadas y lo devuelve como un buffer de imagen."""
    if etiquetas is None:
        etiquetas = ['Media', 'Mediana', 'Moda', 'Desviación Estándar']
    colores = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728']

    # Asegurar que todos los valores sean apropiados para el gráfico
    valores_num = []
    for v in valores:
        if isinstance(v, (int, float)):
            valores_num.append(float(v))
        elif isinstance(v, str) and v.isnumeric():
            valores_num.append(float(v))
        else:
            valores_num.append(0)  # Valores no numéricos se consideran como 0

    # Ajustar el tamaño de la figura
    fig, ax = plt.subplots(figsize=(10, 8))  # Ajusta los valores según sea necesario (ancho, alto)

    ax.bar(etiquetas, valores_num, color=colores[:len(etiquetas)], width=bar_width)
    ax.set_ylabel('Frecuencia')
    ax.set_title(f'{seccion} - {parametro}')

    plt.tight_layout()

    for i, v in enumerate(valores_num):
        ax.text(i, v, f'{v}', ha='center', va='bottom', fontsize=10, color='black')
    
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    img_buffer = BytesIO()
    plt.savefig(img_buffer, format='png')
    plt.close(fig)
    img_buffer.seek(0)

    return img_buffer


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_pdf', methods=['POST'])
def generate_pdf():
    secciones = {
        "Desagüe": ["rpm"],
        "Fermentación": ["rpm", "temperatura (°C)", "humedad relativa (%)", "grados Brix"],
        "Secado": ["rpm", "temperatura (°C)", "humedad relativa (%)", "presión"],
        "Tostado": ["rpm", "temperatura (°C)", "humedad relativa (%)", "presión"]
    }
    
    resultados = {}
    moda_molienda = None
    frecuencia_moda_molienda = 0
    for seccion, parametros in secciones.items():
        resultados[seccion] = {}
        for parametro in parametros:
            valores = request.form.getlist(f'{seccion}_{parametro}')
            valores = [v.strip() for v in valores if v.strip()]  # Eliminar valores vacíos
            if valores:  # Solo calcular estadísticas si hay valores
                valores = list(map(float, valores))  # Convertir a float solo si no está vacío
                resultados[seccion][parametro] = calcular_estadisticas(valores)
            else:
                resultados[seccion][parametro] = (None, None, None)  # O cualquier valor apropiado

    valores_molienda = request.form.getlist('Molienda_molienda')
    valores_molienda = [v.strip().lower() for v in valores_molienda if v.strip()]  # Eliminar valores vacíos
    if valores_molienda:  # Solo calcular moda si hay valores
        moda_molienda, frecuencia_moda_molienda = Counter(valores_molienda).most_common(1)[0]

    # Generar gráficos y almacenarlos en una lista
    graficos = []
    for seccion, parametros in secciones.items():
        for parametro in parametros:
            valores = resultados[seccion][parametro]
            if all(v is not None for v in valores):  # Solo crear gráficos si hay valores válidos
                img_buffer = crear_grafico_barras(seccion, parametro, valores)
                graficos.append(img_buffer)

    if moda_molienda is not None:
        tipos_molienda = ['gruesa', 'media', 'fina']
        valores_molienda = [frecuencia_moda_molienda if tipo == moda_molienda else 0 for tipo in tipos_molienda]
        img_buffer = crear_grafico_barras("Molienda", "molienda", valores_molienda, tipos_molienda, bar_width=0.4)
        graficos.append(img_buffer)


    
    # Crear PDF
    pdf_buffer = BytesIO()
    c = canvas.Canvas(pdf_buffer, pagesize=letter)
    width, height = letter
    

    
    img_width = 550
    img_height = 450

# Colocar la imagen centrada horizontalmente
    x = (595 - img_width) / 2

# Ajustar la posición vertical para que quede bien situada
    y = 700 - img_height - 50 

    for i, img_buffer in enumerate(graficos):
        if i != 0:
            c.showPage()
        img = ImageReader(io.BytesIO(img_buffer.getvalue()))
        c.drawImage(img, x, y, width=img_width, height=img_height)

    c.save()
    pdf_buffer.seek(0)

    return send_file(pdf_buffer, as_attachment=True, download_name='graficos.pdf')



@app.route('/generate_graphs', methods=['POST'])
def generate_graphs():
    secciones = {
        "Desagüe": ["rpm"],
        "Fermentación": ["rpm", "temperatura (°C)", "humedad relativa (%)", "grados Brix"],
        "Secado": ["rpm", "temperatura (°C)", "humedad relativa (%)", "presión"],
        "Tostado": ["rpm", "temperatura (°C)", "humedad relativa (%)", "presión"]
    }
    
    resultados = {}
    moda_molienda = None
    frecuencia_moda_molienda = 0
    for seccion, parametros in secciones.items():
        resultados[seccion] = {}
        for parametro in parametros:
            valores = request.form.getlist(f'{seccion}_{parametro}')
            valores = [v.strip() for v in valores if v.strip()]
            if valores:
                valores = list(map(float, valores))
                resultados[seccion][parametro] = calcular_estadisticas(valores)
            else:
                resultados[seccion][parametro] = (None, None, None)

    valores_molienda = request.form.getlist('Molienda_molienda')
    valores_molienda = [v.strip().lower() for v in valores_molienda if v.strip()]
    if valores_molienda:
        moda_molienda, frecuencia_moda_molienda = Counter(valores_molienda).most_common(1)[0]
    
    graficos_urls = []
    for seccion, parametros in secciones.items():
        for parametro in parametros:
            valores = resultados[seccion][parametro]
            if all(v is not None for v in valores):
                img_buffer = crear_grafico_barras(seccion, parametro, valores)
                img_data = img_buffer.getvalue()
                img_base64 = base64.b64encode(img_data).decode()
                graficos_urls.append(f'data:image/png;base64,{img_base64}')

    if moda_molienda is not None:
        tipos_molienda = ['gruesa', 'media', 'fina']
        valores_molienda = [frecuencia_moda_molienda if tipo == moda_molienda else 0 for tipo in tipos_molienda]
        img_buffer = crear_grafico_barras("Molienda", "molienda", valores_molienda, tipos_molienda, bar_width=0.4)
        img_data = img_buffer.getvalue()
        img_base64 = base64.b64encode(img_data).decode()
        graficos_urls.append(f'data:image/png;base64,{img_base64}')
        


    return jsonify(graficos_urls)

#---------- GRAFICO DE ARAÑA PARA EVALUACION SENSORIAL --------

@app.route('/generate_graphs_spider', methods=['POST'])
def generate_graphs_spider():
    form_data = request.form
    categories = list(form_data.keys())
    values = [int(form_data[category]) for category in categories]

    # Number of variables we're plotting.
    num_vars = len(categories)

    # Compute angle of each axis
    angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()

    # The plot is a circle, so we need to "complete the loop"
    values += values[:1]
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
    ax.fill(angles, values, color='red', alpha=0.25)
    ax.plot(angles, values, color='red', linewidth=2)

    ax.set_yticklabels([])
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories)
    
    # Add a grid and the range numbers
    ax.yaxis.set_ticks_position('left')
    ax.set_yticks(range(1, 6))  # Assuming the range is from 1 to 5
    ax.set_yticklabels([str(i) for i in range(1, 6)], color='lightgray')

    for label in ax.get_yticklabels():
        label.set_fontsize(10)
        label.set_fontweight('normal')
        label.set_fontstyle('normal')

    # Save the figure
    img_buffer = BytesIO()
    plt.savefig(img_buffer, format='png')
    plt.close(fig)
    img_buffer.seek(0)

    img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
    img_url = f'data:image/png;base64,{img_base64}'

    return jsonify([img_url])


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    app.run(debug=True)

    