from firebase_admin import firestore
import bcrypt
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse

# Lấy reference đến cơ sở dữ liệu Firestore
db = firestore.client()

def get_products_data(request):
    try:
        # Thực hiện các thao tác với cơ sở dữ liệu
        collection_ref = db.collection('products')
        documents = collection_ref.stream()

        # Chuyển đổi dữ liệu từ Firestore sang Python dictionary
        data = [{'id': doc.id, **doc.to_dict()} for doc in documents]

        if data:
            return JsonResponse({'status': 'success', 'data': data})
        else:
            return JsonResponse({'status': 'empty', 'message': 'No data found'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'error': str(e)})

def get_product_by_id(request, product_id):
    try:
        # Lấy thông tin sản phẩm từ Firestore
        product_ref = db.collection('products').document(product_id)
        product_data = product_ref.get().to_dict()

        if product_data:
            return JsonResponse({'status': 'success', 'data': product_data})
        else:
            return JsonResponse({'status': 'empty', 'message': 'No data found'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'error': str(e)})

@csrf_exempt
def add_product(request):
    try:
        # Lấy dữ liệu sản phẩm từ request POST
        data = json.loads(request.body.decode('utf-8'))

        images = data.get('images', [])
        product_data = {
            'name': data.get('name'),
            'description': data.get('description'),
            'price': float(data.get('price')),
            'url_image1': images[0]['url'],
            'url_image2': images[1]['url'],
            'quantity': data.get('quantity'),
            'is_delete': 0,
        }

        # Thêm sản phẩm vào Firestore
        product_ref = db.collection('products').add(product_data)

        # Lấy ID của sản phẩm mới thêm vào
        product_id = product_ref[1].id
        # Thêm hình ảnh vào cơ sở dữ liệu
        for image_url in images:
            db.collection('images').add({
                'product_id': product_id, 
                'image_url': image_url['url']
            })

        return JsonResponse({'status': 'success', 'product_id': product_id})

    except Exception as e:
        return JsonResponse({'error': str(e)})

@csrf_exempt
def update_product(request, product_id):
    try:
        # Lấy dữ liệu sản phẩm từ request POST
        data = json.loads(request.body.decode('utf-8'))

        product_data = {
            'name': data.get('name'),
            'description': data.get('description'),
            'price': float(data.get('price')),
            'quantity': data.get('quantity'),
            'is_delete': 0,
        }

        # Cập nhật thông tin sản phẩm trong Firestore
        product_ref = db.collection('products').document(product_id)
        product_ref.update(product_data)
        
        images = data.get('images', [])
        # Thêm hình ảnh vào cơ sở dữ liệu
        for image_url in images:
            db.collection('images').add({
                'product_id': product_id, 
                'image_url': image_url['url']
            })  

        return JsonResponse({'status': 'success'})

    except Exception as e:
        return JsonResponse({'error': str(e)})

@csrf_exempt
def delete_product(request, product_id):
    try:
        # Xóa sản phẩm từ Firestore
        product_ref = db.collection('products').document(product_id)
        product_ref.delete()

        return JsonResponse({'status': 'success'})

    except Exception as e:
        return JsonResponse({'error': str(e)})

@csrf_exempt
def add_user(request):
    try:
        
        if request.method == 'POST':
            data = json.loads(request.body.decode('utf-8'))

            firstname = data.get('firstname')
            lastname = data.get('lastname')
            username = data.get('username')
            password = data.get('password')
            phone = data.get('phone')
            email = data.get('email')
            address = data.get('address')
            role_id = data.get('role_id', '')

            # Kiểm tra xem username đã tồn tại chưa
            username_snapshot = db.collection('users').where('username', '==', username).get()
            if len(username_snapshot) != 0:
                return JsonResponse({'message': 'Người dùng đã tồn tại!'}, status=401)

            # Kiểm tra xem email đã tồn tại chưa
            email_snapshot = db.collection('users').where('email', '==', email).get()
            if len(email_snapshot) != 0:
                return JsonResponse({'message': 'Email đã tồn tại!'}, status=401)
            # Kiểm tra và thiết lập userRole
            if role_id == '':
                default_role_snapshot = db.collection('roles').where('roleName', '==', 'user').limit(1).get()
                if len(default_role_snapshot) != 0:
                    print(default_role_snapshot[0])
                    role_id = default_role_snapshot[0].id


            # Mã hóa mật khẩu
            salt_rounds = 10
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(salt_rounds))

            # Tạo user mới trong Firestore
            new_user = {
                'firstname': firstname,
                'lastname': lastname,
                'username': username,
                'password': hashed_password.decode('utf-8'),
                'phone': phone,
                'email': email,
                'address': address,
                'idRole': role_id,
                'is_delete': 0
            }

            db.collection('users').add(new_user)

            return JsonResponse({'data': new_user})

        return JsonResponse({'error': 'Phương thức không được hỗ trợ'}, status=405)
    except Exception as e:
        return JsonResponse({'error': 'Lỗi máy chủ nội bộ'}, status=500)

@csrf_exempt
def login(request):
    try:
        if request.method == 'POST':
            data = json.loads(request.body.decode('utf-8'))
            username = data.get('username')
            password = data.get('password')

            # Lấy dữ liệu người dùng từ Firestore
            users_ref = db.collection('users')
            user_snapshot = users_ref.where('username', '==', username).limit(1).get()

            if len(user_snapshot) == 0:
                # The list is empty
                email_snapshot = users_ref.where('email', '==', username).limit(1).get()

                if len(email_snapshot) == 0:
                    return JsonResponse({'message': 'Tên người dùng không tồn tại'}, status=401)
                else:
                    user_data = email_snapshot[0].to_dict()
                    user_id = email_snapshot[0].id
            else:
                user_data = user_snapshot[0].to_dict()
                user_id = user_snapshot[0].id


            # Kiểm tra xem mật khẩu được cung cấp có hợp lệ không
            is_password_valid = bcrypt.checkpw(password.encode('utf-8'), user_data['password'].encode('utf-8'))

            if not is_password_valid:
                return JsonResponse({'message': 'Mật khẩu không đúng'}, status=401)

            role_snapshot = db.collection('roles').document(user_data['idRole']).get()
            role_data = role_snapshot.to_dict() if role_snapshot.exists else {}

            user_info = {
                'id': user_id,
                'firstname': user_data['firstname'],
                'lastname': user_data['lastname'],
                'username': user_data['username'],
                'phone': user_data['phone'],
                'email': user_data['email'],
                'address': user_data['address'],
                'idRole': user_data['idRole'],
                'is_delete': user_data['is_delete'],
            }

            response_data = {
                'user': user_info,
                'roleName': role_data.get('roleName', ''),
            }

            return JsonResponse(response_data)

        return JsonResponse({'error': 'Phương thức không được hỗ trợ'}, status=405)
    except Exception as e:
        print(e)
        return JsonResponse({'error': 'Lỗi máy chủ nội bộ'}, status=500)

def images_by_product_id(request, product_id):
    try:
        # Lấy hình ảnh cho product_id cụ thể
        images_ref = db.collection('images')
        
        images_snapshot = images_ref.where('product_id', '==', product_id).get()

        images_data = [{'id': doc.id, **doc.to_dict()} for doc in images_snapshot]
        if not images_data:
            return JsonResponse({'message': 'Hình ảnh sản phẩm không tồn tại'}, status=404)
        return JsonResponse({'status': 'success', 'data': images_data})
    except Exception as e:
        print(e)
        return JsonResponse({'error': 'Lỗi máy chủ nội bộ'}, status=500)    

@csrf_exempt
def delete_image(request, image_id):
    try:
        # Lấy product_id trước khi xóa hình ảnh
        image_ref = db.collection('images').document(image_id)
        image_snapshot = image_ref.get()

        if not image_snapshot.exists:
            return JsonResponse({'message': 'Image not found'}, status=404)

        product_id = image_snapshot.to_dict().get('product_id')

        # Xóa tài liệu hình ảnh
        image_ref.delete()

        # Lấy danh sách hình ảnh còn lại cho product_id cụ thể
        remaining_images_snapshot = db.collection('images').where('product_id', '==', product_id).get()

        # Lấy URL của hình ảnh còn lại để cập nhật trong tài liệu sản phẩm
        url_image1 = remaining_images_snapshot[0].to_dict().get('image_url', '')
        url_image2 = remaining_images_snapshot[1].to_dict().get('image_url', '')

        # Cập nhật tài liệu sản phẩm
        db.collection('products').document(product_id).update({
            'url_image1': url_image1,
            'url_image2': url_image2,
        })

        remaining_images_data = [{'id': doc.id, **doc.to_dict()} for doc in remaining_images_snapshot]

        return JsonResponse({"data": remaining_images_data})
    except Exception as e:
        return JsonResponse({'error': 'Lỗi máy chủ nội bộ'}, status=500)