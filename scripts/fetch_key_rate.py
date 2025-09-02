import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os
import time
import pandas as pd

def get_key_rate():
    url = 'https://cbr.ru/hd_base/keyrate/'
    
    # Упрощенные, но рабочие заголовки
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Используем pandas для парсинга таблицы - это надежнее
        tables = pd.read_html(response.text)
        
        if not tables:
            print("Не удалось найти таблицы на странице")
            return None
            
        # Берем первую таблицу
        df = tables[0]
        
        # Проверяем структуру таблицы
        if len(df.columns) < 2:
            print("Таблица имеет неправильную структуру")
            return None
            
        # Берем последнюю актуальную ставку
        latest_row = df.iloc[0]
        date_str = latest_row.iloc[0]
        rate_str = str(latest_row.iloc[1])
        
        # Парсим дату и значение
        try:
            date_obj = datetime.strptime(date_str, '%d.%m.%Y')
            formatted_date = date_obj.strftime('%Y-%m-%d')
            rate_value = float(rate_str.replace(',', '.'))
            
            # Проверяем корректность значения ставки
            if rate_value > 100:  # Если значение слишком большое
                print(f"Подозрительное значение ставки: {rate_value}. Делим на 100.")
                rate_value = rate_value / 100
            elif rate_value < 1:  # Если значение слишком маленькое
                print(f"Подозрительное значение ставки: {rate_value}. Умножаем на 100.")
                rate_value = rate_value * 100
                
            # Округляем до 2 знаков после запятой
            rate_value = round(rate_value, 2)
            print(f"Получена ставка: {rate_value}%")
            
        except ValueError as e:
            print(f"Ошибка парсинга данных: {e}")
            return None
        
        return {
            "date": formatted_date,
            "value": rate_value,
            "updated_at": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        }
        
    except requests.exceptions.RequestException as e:
        print(f"Ошибка сети: {e}")
        return None
    except Exception as e:
        print(f"Произошла ошибка: {e}")
        return None

# Исправленная альтернативная функция
def get_key_rate_alternative():
    """Альтернативный способ получения ключевой ставки через API"""
    try:
        # Правильный URL для получения данных в машиночитаемом формате
        api_url = 'https://www.cbr.ru/hd_base/keyrate/?UniDbQuery.Posted=True&UniDbQuery.From=2000-01-01&UniDbQuery.To=2030-12-31'
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/html, */*'
        }
        
        response = requests.get(api_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Пробуем парсить как JSON (если API вернет JSON)
        try:
            data = response.json()
            if data and len(data) > 0:
                latest = data[0]
                rate_value = latest['value']
                
                # Проверяем корректность значения
                if rate_value > 100:
                    rate_value = rate_value / 100
                elif rate_value < 1:
                    rate_value = rate_value * 100
                rate_value = round(rate_value, 2)
                
                return {
                    "date": latest['date'],
                    "value": rate_value,
                    "updated_at": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
                }
        except:
            # Если не JSON, парсим HTML таблицу
            pass
        
        # Парсим таблицу с помощью pandas
        dfs = pd.read_html(response.text)
        if dfs and len(dfs) > 0:
            df = dfs[0]
            latest_row = df.iloc[0]
            
            date_str = str(latest_row.iloc[0])
            rate_str = str(latest_row.iloc[1])
            
            date_obj = datetime.strptime(date_str, '%d.%m.%Y')
            formatted_date = date_obj.strftime('%Y-%m-%d')
            rate_value = float(rate_str.replace(',', '.'))
            
            # Проверяем корректность значения
            if rate_value > 100:
                rate_value = rate_value / 100
            elif rate_value < 1:
                rate_value = rate_value * 100
            rate_value = round(rate_value, 2)
            
            return {
                "date": formatted_date,
                "value": rate_value,
                "updated_at": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
            }
        
        print("Не удалось найти данные в альтернативном методе")
        return None
        
    except Exception as e:
        print(f"Альтернативный метод также не сработал: {e}")
        return None

# Еще один запасной метод
def get_key_rate_backup():
    """Резервный метод через главную страницу ЦБ"""
    try:
        url = 'https://www.cbr.ru/'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Ищем блок с ключевой ставкой на главной
        key_rate_block = soup.find('div', class_='key-rate')
        if key_rate_block:
            rate_text = key_rate_block.get_text(strip=True)
            # Извлекаем число из текста
            import re
            match = re.search(r'(\d+,\d+)', rate_text)
            if match:
                rate_value = float(match.group(1).replace(',', '.'))
                
                # Проверяем корректность значения
                if rate_value > 100:
                    rate_value = rate_value / 100
                elif rate_value < 1:
                    rate_value = rate_value * 100
                rate_value = round(rate_value, 2)
                
                return {
                    "date": datetime.now().strftime('%Y-%m-%d'),
                    "value": rate_value,
                    "updated_at": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
                }
        
        return None
        
    except Exception as e:
        print(f"Резервный метод не сработал: {e}")
        return None

# Основная логика
if __name__ == "__main__":
    print("Начало получения ключевой ставки...")
    
    # Пробуем основной метод
    key_rate_data = get_key_rate()
    
    # Если основной метод не сработал, пробуем альтернативный
    if not key_rate_data:
        print("Основной метод не сработал, пробуем альтернативный...")
        time.sleep(1)
        key_rate_data = get_key_rate_alternative()
    
    # Если альтернативный не сработал, пробуем резервный
    if not key_rate_data:
        print("Альтернативный метод не сработал, пробуем резервный...")
        time.sleep(1)
        key_rate_data = get_key_rate_backup()
    
    # Создаем папку 'data', если её нет
    os.makedirs('data', exist_ok=True)
    
    if key_rate_data:
        # Сохраняем данные в файл внутри папки data
        file_path = 'data/key_rate.json'
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(key_rate_data, f, ensure_ascii=False, indent=2)
        print(f"Ключевая ставка успешно сохранена в {file_path}: {key_rate_data}")
        exit(0)
    else:
        print("Не удалось получить ключевую ставку. Файл не будет обновлен.")
        exit(1)