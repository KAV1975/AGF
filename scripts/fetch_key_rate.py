import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os
import time

def get_key_rate():
    url = 'https://cbr.ru/hd_base/keyrate/'
    
    # Добавляем заголовки чтобы имитировать браузер
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
    }
    
    try:
        # Добавляем таймаут и заголовки
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Проверяем, что получили HTML, а не страницу с ошибкой
        if '403 Forbidden' in response.text:
            print("Получена страница с ошибкой 403 Forbidden")
            return None
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Ищем таблицу - класс может быть другим
        table = soup.find('table', {'class': 'data'})
        if not table:
            # Пробуем найти любую таблицу с ставками
            table = soup.find('table')
            if not table:
                print("Не удалось найти таблицу с ставками.")
                print("Полученный HTML:", response.text[:500])  # Логируем начало HTML для отладки
                return None
            
        rows = table.find_all('tr')
        if len(rows) < 2:
            print("В таблице нет данных или недостаточно строк.")
            return None
            
        # Ищем строку с данными (пропускаем заголовок)
        data_row = None
        for row in rows[1:]:  # Пропускаем первую строку (заголовок)
            cells = row.find_all('td')
            if len(cells) >= 2:
                data_row = row
                break
                
        if not data_row:
            print("Не найдено строк с данными.")
            return None
            
        cells = data_row.find_all('td')
        
        if len(cells) < 2:
            print("Недостаточно ячеек в строке.")
            return None
            
        date_str = cells[0].get_text(strip=True)
        rate_str = cells[1].get_text(strip=True)
        
        # Парсим дату и значение
        try:
            date_obj = datetime.strptime(date_str, '%d.%m.%Y')
            formatted_date = date_obj.strftime('%Y-%m-%d')
            rate_value = float(rate_str.replace(',', '.'))
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

# Альтернативная функция на случай если основная не работает
def get_key_rate_alternative():
    """Альтернативный способ получения ключевой ставки"""
    try:
        # Пробуем получить данные через API ЦБ
        api_url = 'https://www.cbr.ru/scripts/XML_daily_eng.asp'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(api_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Здесь нужно добавить парсинг XML ответа
        # Это упрощенный пример -可能需要 доработки под конкретную структуру XML
        
        print("Альтернативный метод: получили ответ от API")
        # Временное решение - возвращаем None чтобы попробовать основной метод
        return None
        
    except Exception as e:
        print(f"Альтернативный метод также не сработал: {e}")
        return None

# Основная логика
if __name__ == "__main__":
    print("Начало получения ключевой ставки...")
    
    # Пробуем основной метод
    key_rate_data = get_key_rate()
    
    # Если основной метод не сработал, пробуем альтернативный
    if not key_rate_data:
        print("Основной метод не сработал, пробуем альтернативный...")
        time.sleep(2)  # Небольшая задержка
        key_rate_data = get_key_rate_alternative()
    
    # Создаем папку 'data', если её нет
    os.makedirs('data', exist_ok=True)
    
    if key_rate_data:
        # Сохраняем данные в файл внутри папки data
        file_path = 'data/key_rate.json'
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(key_rate_data, f, ensure_ascii=False, indent=2)
        print(f"Ключевая ставка успешно сохранена в {file_path}: {key_rate_data}")
    else:
        print("Не удалось получить ключевую ставку. Файл не будет обновлен.")
        # Можно выйти с ошибкой, чтобы Action пометился как failed
        exit(1)